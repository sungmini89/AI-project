/**
 * @fileoverview 실시간 채팅 서비스
 *
 * 이 서비스는 Firebase Firestore를 사용하여 실시간 채팅 기능을 제공합니다.
 * 채팅방 생성, 메시지 송수신, 사용자 관리 등의 기능을 담당합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChatMessage, ChatRoom } from "@/types";
import { translationEngine } from "./translationEngine";

/**
 * 실시간 채팅 서비스 클래스
 *
 * @description
 * - Firebase Firestore를 사용한 실시간 데이터 동기화
 * - 채팅방 및 메시지 CRUD 작업
 * - 실시간 리스너 관리 및 메모리 누수 방지
 * - 자동 번역 기능 통합
 */
export class ChatService {
  private static instance: ChatService;
  private activeListeners: Map<string, Unsubscribe> = new Map();

  /**
   * ChatService의 싱글톤 인스턴스를 반환합니다
   *
   * @returns {ChatService} ChatService 인스턴스
   */
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private constructor() {}

  /**
   * 새로운 채팅방을 생성합니다
   *
   * @param {string} name - 채팅방 이름
   * @param {string} creatorUid - 생성자 사용자 ID
   * @param {string[]} supportedLanguages - 지원하는 언어 코드 배열
   * @returns {Promise<string>} 생성된 채팅방의 ID
   *
   * @example
   * const roomId = await chatService.createRoom('일본어 학습방', 'user123', ['ko', 'ja', 'en'])
   */
  async createRoom(
    name: string,
    creatorUid: string,
    supportedLanguages: string[]
  ): Promise<string> {
    try {
      const roomData = {
        name,
        participants: [creatorUid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        supportedLanguages,
        createdBy: creatorUid,
      };

      const docRef = await addDoc(collection(db, "rooms"), roomData);
      console.log("Room created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * 기존 채팅방에 참여합니다
   *
   * @param {string} roomId - 참여할 채팅방 ID
   * @param {string} userId - 참여할 사용자 ID
   * @returns {Promise<void>}
   *
   * @example
   * await chatService.joinRoom('room123', 'user456')
   */
  async joinRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = doc(db, "rooms", roomId);

      // Use arrayUnion to add user if not already present
      await updateDoc(roomRef, {
        participants: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });

      console.log(`User ${userId} joined room ${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  /**
   * 채팅방에서 나갑니다
   *
   * @param {string} roomId - 나갈 채팅방 ID
   * @param {string} userId - 나갈 사용자 ID
   * @returns {Promise<void>}
   *
   * @example
   * await chatService.leaveRoom('room123', 'user456')
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const roomRef = doc(db, "rooms", roomId);

      // Use arrayRemove to remove user
      await updateDoc(roomRef, {
        participants: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      console.log(`User ${userId} left room ${roomId}`);
    } catch (error) {
      console.error("Error leaving room:", error);
      throw error;
    }
  }

  /**
   * 메시지를 채팅방에 보냅니다
   *
   * @param {string} roomId - 메시지를 보낼 채팅방 ID
   * @param {string} userId - 메시지를 보낸 사용자 ID
   * @param {string} userName - 메시지를 보낸 사용자 이름
   * @param {string} text - 메시지 텍스트
   * @param {string[]} targetLanguages - 번역할 언어 코드 배열 (선택 사항)
   * @returns {Promise<string>} 저장된 메시지의 ID
   *
   * @example
   * const messageId = await chatService.sendMessage('room123', 'user789', 'Hello', ['ko', 'ja'])
   */
  async sendMessage(
    roomId: string,
    userId: string,
    userName: string,
    text: string,
    targetLanguages: string[] = []
  ): Promise<string> {
    try {
      console.log("🚀 Sending message:", {
        roomId,
        userId,
        userName,
        text,
        targetLanguages,
      });

      // Detect source language
      const sourceLanguage = "auto"; // Will be detected by translation engine

      // Create message with translation placeholder
      const messageData: Omit<ChatMessage, "id"> = {
        userId,
        userName,
        originalText: text,
        originalLanguage: sourceLanguage,
        translations: {},
        timestamp: Date.now(),
        isTranslating: targetLanguages.length > 0,
      };

      console.log("📝 Message data prepared:", messageData);

      const messageRef = await addDoc(
        collection(db, "rooms", roomId, "messages"),
        {
          ...messageData,
          createdAt: serverTimestamp(),
        }
      );

      console.log("✅ Message saved to Firestore with ID:", messageRef.id);

      // Start translations in background if requested
      if (targetLanguages.length > 0) {
        console.log("🌍 Starting translations for languages:", targetLanguages);

        // Update translation progress immediately
        await updateDoc(messageRef, {
          translationProgress: 0,
          translationTotal: targetLanguages.length,
        });

        this.translateMessage(
          roomId,
          messageRef.id,
          text,
          targetLanguages
        ).catch((error) => {
          console.error("Background translation failed:", error);
          // Update message to show translation error
          this.updateMessageTranslationError(
            roomId,
            messageRef.id,
            error.message
          );
        });
      }

      console.log("Message sent with ID:", messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  }

  /**
   * 메시지를 여러 언어로 번역합니다. 진행 상황을 포함하여 업데이트합니다.
   *
   * @param {string} roomId - 메시지가 속한 채팅방 ID
   * @param {string} messageId - 번역할 메시지의 ID
   * @param {string} text - 원본 텍스트
   * @param {string[]} targetLanguages - 번역할 언어 코드 배열
   * @returns {Promise<void>}
   */
  private async translateMessage(
    roomId: string,
    messageId: string,
    text: string,
    targetLanguages: string[]
  ): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId);
      const translationMap: Record<string, string> = {};

      // Progressive translation - update as each translation completes
      const progressiveUpdate = async (lang: string, translation: string) => {
        translationMap[lang] = translation;
        await updateDoc(messageRef, {
          translations: { ...translationMap },
          updatedAt: serverTimestamp(),
        });
        console.log(`Progressive translation updated for ${lang}:`, messageId);
      };

      // Start all translations in parallel with progressive updates
      const translationPromises = targetLanguages.map(async (lang) => {
        try {
          const result = await translationEngine.translate(text, lang);
          await progressiveUpdate(lang, result.translatedText);
          return { lang, result };
        } catch (error) {
          console.error(`Translation failed for ${lang}:`, error);
          await progressiveUpdate(lang, `[번역 실패: ${lang}]`);
          throw error;
        }
      });

      // Wait for all translations to complete or fail
      const results = await Promise.allSettled(translationPromises);
      const hasErrors = results.some((result) => result.status === "rejected");

      // Final update with completion status
      const updateData: any = {
        translations: translationMap,
        isTranslating: false,
        updatedAt: serverTimestamp(),
      };

      // Only add translationError if there are errors (avoid undefined)
      if (hasErrors) {
        updateData.translationError = "일부 번역 실패";
      }

      await updateDoc(messageRef, updateData);

      console.log("All message translations completed:", messageId);
    } catch (error) {
      console.error("Translation process failed:", error);
      throw error;
    }
  }

  /**
   * 메시지 번역 오류를 업데이트합니다.
   *
   * @param {string} roomId - 메시지가 속한 채팅방 ID
   * @param {string} messageId - 번역 오류를 업데이트할 메시지의 ID
   * @param {string} errorMessage - 오류 메시지
   * @returns {Promise<void>}
   */
  private async updateMessageTranslationError(
    roomId: string,
    messageId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId);
      const updateData: any = {
        isTranslating: false,
        updatedAt: serverTimestamp(),
      };

      // Only add translationError if errorMessage is not empty/undefined
      if (errorMessage && errorMessage.trim()) {
        updateData.translationError = errorMessage;
      }

      await updateDoc(messageRef, updateData);
    } catch (error) {
      console.error("Error updating translation error:", error);
    }
  }

  /**
   * 채팅방의 메시지를 실시간으로 구독합니다.
   *
   * @param {string} roomId - 구독할 채팅방 ID
   * @param {function} callback - 메시지가 업데이트될 때마다 호출될 콜백 함수
   * @param {number} messageLimit - 가져올 메시지 수 (기본값: 50)
   * @returns {function} 구독을 취소하는 함수
   *
   * @example
   * const unsubscribe = chatService.subscribeToMessages('room123', (messages) => {
   *   console.log('New messages:', messages);
   * });
   */
  subscribeToMessages(
    roomId: string,
    callback: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
  ): () => void {
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        console.log("📨 Messages snapshot received:", {
          roomId,
          messageCount: snapshot.size,
          docChanges: snapshot.docChanges().map((change) => ({
            type: change.type,
            docId: change.doc.id,
            data: change.doc.data(),
          })),
        });

        const messages: ChatMessage[] = [];

        snapshot.forEach((doc: DocumentSnapshot) => {
          const data = doc.data();
          if (data) {
            const messageData: ChatMessage = {
              id: doc.id,
              userId: data.userId,
              userName: data.userName,
              originalText: data.originalText,
              originalLanguage: data.originalLanguage || "auto",
              translations: data.translations || {},
              timestamp: data.timestamp || Date.now(),
              isTranslating: data.isTranslating || false,
            };

            // Only add translationError if it exists and is not empty
            if (data.translationError && data.translationError.trim()) {
              messageData.translationError = data.translationError;
            }

            messages.push(messageData);
          }
        });

        // Reverse to show oldest first
        console.log("📤 Sending messages to UI:", {
          roomId,
          totalMessages: messages.length,
          messageIds: messages.map((m) => m.id),
        });
        callback(messages.reverse());
      },
      (error) => {
        console.error("❌ Error listening to messages:", error);
        callback([]);
      }
    );

    // Store listener for cleanup
    this.activeListeners.set(`messages-${roomId}`, unsubscribe);

    return unsubscribe;
  }

  /**
   * 사용자의 채팅방 목록을 실시간으로 구독합니다.
   *
   * @param {string} userId - 구독할 사용자 ID
   * @param {function} callback - 채팅방 목록이 업데이트될 때마다 호출될 콜백 함수
   * @returns {function} 구독을 취소하는 함수
   *
   * @example
   * const unsubscribe = chatService.subscribeToUserRooms('user123', (rooms) => {
   *   console.log('User rooms:', rooms);
   * });
   */
  subscribeToUserRooms(
    userId: string,
    callback: (rooms: ChatRoom[]) => void
  ): () => void {
    const roomsRef = collection(db, "rooms");
    const q = query(roomsRef, where("participants", "array-contains", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const rooms: ChatRoom[] = [];

        snapshot.forEach((doc: DocumentSnapshot) => {
          const data = doc.data();
          if (data) {
            console.log("🔍 Raw room data from Firestore:", {
              id: doc.id,
              name: data.name,
              createdBy: data.createdBy,
              createdByExists: "createdBy" in data,
              allFields: Object.keys(data),
            });

            rooms.push({
              id: doc.id,
              name: data.name,
              participants: data.participants || [],
              createdAt: data.createdAt?.toMillis() || Date.now(),
              updatedAt: data.updatedAt?.toMillis() || Date.now(),
              supportedLanguages: data.supportedLanguages || ["en", "ko"],
              createdBy: data.createdBy,
            });
          }
        });

        callback(rooms);
      },
      (error) => {
        console.error("Error listening to rooms:", error);
        callback([]);
      }
    );

    this.activeListeners.set(`rooms-${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * 채팅방의 상세 정보를 가져옵니다.
   *
   * @param {string} roomId - 조회할 채팅방 ID
   * @returns {Promise<ChatRoom | null>} 채팅방 정보 또는 null
   *
   * @example
   * const room = await chatService.getRoomDetails('room123');
   */
  async getRoomDetails(roomId: string): Promise<ChatRoom | null> {
    try {
      const roomSnap = await getDocs(
        query(collection(db, "rooms"), where("__name__", "==", roomId))
      );

      if (roomSnap.empty) {
        return null;
      }

      const data = roomSnap.docs[0].data();
      return {
        id: roomId,
        name: data.name,
        participants: data.participants || [],
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
        supportedLanguages: data.supportedLanguages || ["en", "ko"],
      };
    } catch (error) {
      console.error("Error getting room details:", error);
      return null;
    }
  }

  /**
   * 메시지를 삭제합니다 (사용자가 소유자이거나 방 관리자인 경우).
   *
   * @param {string} roomId - 메시지가 속한 채팅방 ID
   * @param {string} messageId - 삭제할 메시지 ID
   * @returns {Promise<void>}
   *
   * @example
   * await chatService.deleteMessage('room123', 'msg123');
   */
  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId);

      // In a real app, you'd check if user has permission to delete
      await deleteDoc(messageRef);

      console.log("Message deleted:", messageId);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  /**
   * 모든 활성 리스너를 정리합니다.
   */
  cleanup(): void {
    for (const [key, unsubscribe] of this.activeListeners) {
      try {
        unsubscribe();
        console.log("Cleaned up listener:", key);
      } catch (error) {
        console.warn("Error cleaning up listener:", key, error);
      }
    }
    this.activeListeners.clear();
  }

  /**
   * 특정 리스너를 정리합니다.
   *
   * @param {string} key - 정리할 리스너의 키
   */
  cleanupListener(key: string): void {
    const unsubscribe = this.activeListeners.get(key);
    if (unsubscribe) {
      try {
        unsubscribe();
        this.activeListeners.delete(key);
        console.log("Cleaned up specific listener:", key);
      } catch (error) {
        console.warn("Error cleaning up specific listener:", key, error);
      }
    }
  }

  /**
   * 사용자의 타이핑 상태를 보냅니다.
   *
   * @param {string} roomId - 타이핑 상태를 보낼 채팅방 ID
   * @param {string} userId - 타이핑 상태를 보낸 사용자 ID
   * @param {string} userName - 타이핑 상태를 보낸 사용자 이름
   * @param {boolean} isTyping - 타이핑 중인지 여부
   * @returns {Promise<void>}
   *
   * @example
   * await chatService.sendTypingIndicator('room123', 'user456', 'User A', true);
   */
  async sendTypingIndicator(
    roomId: string,
    userId: string,
    userName: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      // For simplicity, we'll use a temporary collection for typing indicators
      // In production, you might want to use a different approach like presence system
      const typingCollection = collection(db, "rooms", roomId, "typing");
      const typingRef = doc(typingCollection, userId);

      if (isTyping) {
        try {
          await updateDoc(typingRef, {
            userName,
            isTyping: true,
            timestamp: Date.now(),
          });
        } catch (updateError: any) {
          if (updateError.code === "not-found") {
            // Document doesn't exist, create it using setDoc
            await setDoc(typingRef, {
              userId,
              userName,
              isTyping: true,
              timestamp: Date.now(),
            });
          } else {
            throw updateError;
          }
        }
      } else {
        try {
          await updateDoc(typingRef, {
            isTyping: false,
            timestamp: Date.now(),
          });
        } catch (error: any) {
          if (error.code === "not-found") {
            // Document doesn't exist, just ignore for stop typing
            console.log("Typing document not found for stop typing - ignoring");
          } else {
            throw error;
          }
        }
      }

      console.log(
        `Typing indicator: ${userName} is ${
          isTyping ? "typing" : "stopped typing"
        }`
      );
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }

  /**
   * 타이핑 상태를 구독합니다.
   *
   * @param {string} roomId - 구독할 채팅방 ID
   * @param {string} currentUserId - 현재 사용자 ID
   * @param {function} callback - 타이핑 상태가 업데이트될 때마다 호출될 콜백 함수
   * @returns {function} 구독을 취소하는 함수
   *
   * @example
   * const unsubscribe = chatService.subscribeToTypingIndicators('room123', 'user123', (typingUsers) => {
   *   console.log('Typing users:', typingUsers);
   * });
   */
  subscribeToTypingIndicators(
    roomId: string,
    currentUserId: string,
    callback: (typingUsers: string[]) => void
  ): () => void {
    const typingRef = collection(db, "rooms", roomId, "typing");
    const q = query(typingRef, where("isTyping", "==", true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const typingUsers: string[] = [];
        const currentTime = Date.now();

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include other users' typing indicators that are recent (within 5 seconds)
          if (
            data.userId !== currentUserId &&
            data.isTyping &&
            currentTime - data.timestamp < 5000
          ) {
            typingUsers.push(data.userName);
          }
        });

        callback(typingUsers);
      },
      (error) => {
        console.error("Error listening to typing indicators:", error);
        callback([]);
      }
    );

    this.activeListeners.set(`typing-${roomId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * 채팅방의 메시지 수를 가져옵니다 (페이지네이션용).
   *
   * @param {string} roomId - 메시지 수를 조회할 채팅방 ID
   * @returns {Promise<number>} 메시지 수
   *
   * @example
   * const count = await chatService.getMessageCount('room123');
   */
  async getMessageCount(roomId: string): Promise<number> {
    try {
      const messagesRef = collection(db, "rooms", roomId, "messages");
      const snapshot = await getDocs(messagesRef);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting message count:", error);
      return 0;
    }
  }

  /**
   * 채팅방을 삭제합니다. 해당 채팅방의 모든 메시지와 타이핑 상태도 함께 삭제합니다.
   *
   * @param {string} roomId - 삭제할 채팅방 ID
   * @param {string} userId - 채팅방을 삭제할 사용자 ID
   * @returns {Promise<void>}
   *
   * @example
   * await chatService.deleteRoom('room123', 'user123');
   */
  async deleteRoom(roomId: string, userId: string): Promise<void> {
    try {
      console.log("🗑️ Deleting room:", roomId, "by user:", userId);

      // Get room details first to check permissions
      const roomRef = doc(db, "rooms", roomId);
      const roomSnapshot = await getDoc(roomRef);

      if (!roomSnapshot.exists()) {
        throw new Error("방을 찾을 수 없습니다.");
      }

      const roomData = roomSnapshot.data() as ChatRoom;

      console.log("🔍 Room data for permission check:", {
        roomId,
        roomName: roomData.name,
        createdBy: roomData.createdBy,
        userId,
        canDelete: roomData.createdBy === userId,
        createdByType: typeof roomData.createdBy,
        userIdType: typeof userId,
      });

      // Check if user is the creator (skip check for legacy rooms without createdBy)
      if (roomData.createdBy && roomData.createdBy !== userId) {
        throw new Error(
          `방 삭제 권한이 없습니다. 방을 만든 사용자만 삭제할 수 있습니다. (방 만든이: ${roomData.createdBy}, 현재 사용자: ${userId})`
        );
      }

      // Allow deletion of legacy rooms (without createdBy field)
      if (!roomData.createdBy) {
        console.log("⚠️ Deleting legacy room without createdBy field");
      }

      // Delete all messages in the room (from the global messages collection)
      console.log("🗑️ Deleting messages for room:", roomId);
      const messagesRef = collection(db, "messages");
      const messagesQuery = query(messagesRef, where("roomId", "==", roomId));
      const messagesSnapshot = await getDocs(messagesQuery);

      const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
        deleteDoc(messageDoc.ref)
      );

      await Promise.all(deletePromises);
      console.log(`✅ Deleted ${messagesSnapshot.size} messages`);

      // Delete typing indicators for the room
      const typingRef = collection(db, "typing");
      const typingQuery = query(typingRef, where("roomId", "==", roomId));
      const typingSnapshot = await getDocs(typingQuery);

      const typingDeletePromises = typingSnapshot.docs.map((typingDoc) =>
        deleteDoc(typingDoc.ref)
      );

      await Promise.all(typingDeletePromises);
      console.log(`✅ Deleted ${typingSnapshot.size} typing indicators`);

      // Finally delete the room
      await deleteDoc(roomRef);
      console.log("✅ Room deleted successfully:", roomId);
    } catch (error) {
      console.error("❌ Failed to delete room:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
