/**
 * @fileoverview 사용자 인증 및 관리 서비스
 *
 * 이 서비스는 Firebase Authentication을 사용하여 사용자 인증을 처리하고,
 * Firestore에 사용자 데이터를 동기화합니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { ChatUser } from "@/types";

/**
 * 사용자 서비스 클래스
 *
 * @description
 * - Firebase Authentication을 통한 사용자 인증 관리
 * - Firestore에 사용자 데이터 동기화
 * - 사용자 온라인/오프라인 상태 관리
 * - 오프라인 감지 기능
 */
export class UserService {
  private static instance: UserService;
  private currentUser: ChatUser | null = null;

  /**
   * UserService의 싱글톤 인스턴스를 반환합니다
   *
   * @returns {UserService} UserService 인스턴스
   */
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private constructor() {
    this.initializeAuthListener();
  }

  /**
   * Firebase 인증 상태 변경 리스너를 초기화합니다
   *
   * @description
   * 사용자가 로그인하거나 로그아웃할 때마다 호출되어
   * 현재 사용자 데이터를 동기화합니다.
   */
  private initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.syncUserData(user);
      } else {
        this.currentUser = null;
      }
    });
  }

  /**
   * 새로운 사용자를 등록합니다
   *
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @param {string} displayName - 사용자 표시 이름
   * @returns {Promise<UserCredential>} 생성된 사용자 정보
   *
   * @example
   * const userCredential = await userService.signUp('user@example.com', 'password123', '사용자명');
   */
  async signUp(
    email: string,
    password: string,
    displayName: string
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName });

      // Send email verification
      await sendEmailVerification(user);

      // Create user document in Firestore
      await this.createUserDocument(user, displayName);

      console.log("User signed up:", user.uid);
      return userCredential;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  /**
   * 기존 사용자로 로그인합니다
   *
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<UserCredential>} 로그인된 사용자 정보
   *
   * @example
   * const userCredential = await userService.signIn('user@example.com', 'password123');
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update last seen
      await this.updateUserPresence(userCredential.user.uid, true);

      console.log("User signed in:", userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  /**
   * 익명으로 로그인합니다 (빠른 테스트용)
   *
   * @param {string} [displayName] - 사용자 표시 이름 (선택 사항)
   * @returns {Promise<UserCredential>} 익명 사용자 정보
   *
   * @example
   * const userCredential = await userService.signInAnonymously('게스트 사용자');
   */
  async signInAnonymously(displayName?: string): Promise<UserCredential> {
    try {
      console.log("🚀 Starting anonymous sign in...");
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      console.log("✅ Anonymous user created:", user.uid);

      // Create user document with guest name
      const guestName = displayName || `Guest_${user.uid.slice(-4)}`;
      await this.createUserDocument(user, guestName);

      console.log("✅ Anonymous user document created with name:", guestName);
      return userCredential;
    } catch (error) {
      console.error("❌ Anonymous sign in error:", error);
      throw error;
    }
  }

  /**
   * 사용자를 로그아웃합니다
   *
   * @returns {Promise<void>} 로그아웃 완료 시 반환
   *
   * @example
   * await userService.signOut();
   */
  async signOut(): Promise<void> {
    try {
      if (this.currentUser) {
        await this.updateUserPresence(this.currentUser.uid, false);
      }

      await firebaseSignOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  /**
   * Firestore에 사용자 문서를 생성합니다
   *
   * @param {User} user - Firebase Authentication 사용자 객체
   * @param {string} displayName - 사용자 표시 이름
   * @returns {Promise<void>} 문서 생성 완료 시 반환
   */
  private async createUserDocument(
    user: User,
    displayName: string
  ): Promise<void> {
    const userData: Omit<ChatUser, "uid"> = {
      displayName: displayName || user.email?.split("@")[0] || "Anonymous",
      photoURL: user.photoURL || "",
      preferredLanguage: "ko", // Default to Korean
      isOnline: true,
      lastSeen: Date.now(),
    };

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("User document created:", user.uid);
  }

  /**
   * Auth 및 Firestore 데이터를 동기화합니다
   *
   * @param {User} user - Firebase Authentication 사용자 객체
   * @returns {Promise<void>} 동기화 완료 시 반환
   */
  private async syncUserData(user: User): Promise<void> {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await this.createUserDocument(user, user.displayName || "");
      } else {
        // Update existing user data
        await updateDoc(userRef, {
          isOnline: true,
          lastSeen: Date.now(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update local current user
      const userData = userDoc.data();
      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName || userData?.displayName || "Anonymous",
        photoURL: user.photoURL || userData?.photoURL || "",
        preferredLanguage: userData?.preferredLanguage || "ko",
        isOnline: true,
        lastSeen: Date.now(),
      };

      console.log("User data synced:", user.uid);
    } catch (error) {
      console.error("Error syncing user data:", error);
    }
  }

  /**
   * 사용자 온라인/오프라인 상태를 업데이트합니다
   *
   * @param {string} uid - 사용자 UID
   * @param {boolean} isOnline - 온라인 상태 (true) 또는 오프라인 상태 (false)
   * @returns {Promise<void>} 상태 업데이트 완료 시 반환
   */
  async updateUserPresence(uid: string, isOnline: boolean): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        isOnline,
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
      });

      if (this.currentUser && this.currentUser.uid === uid) {
        this.currentUser.isOnline = isOnline;
        this.currentUser.lastSeen = Date.now();
      }

      console.log(
        `User presence updated: ${uid} - ${isOnline ? "online" : "offline"}`
      );
    } catch (error) {
      console.error("Error updating user presence:", error);
    }
  }

  /**
   * 사용자 프로필을 업데이트합니다
   *
   * @param {Object} updates - 업데이트할 프로필 속성
   * @param {string} [updates.displayName] - 표시 이름
   * @param {string} [updates.preferredLanguage] - 선호 언어
   * @param {string} [updates.photoURL] - 프로필 사진 URL
   * @returns {Promise<void>} 프로필 업데이트 완료 시 반환
   *
   * @example
   * await userService.updateUserProfile({ displayName: '새 사용자명' });
   */
  async updateUserProfile(updates: {
    displayName?: string;
    preferredLanguage?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      // Update Firebase Auth profile if display name changed
      if (updates.displayName && updates.displayName !== user.displayName) {
        await updateProfile(user, { displayName: updates.displayName });
      }

      // Update Firestore document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local current user
      if (this.currentUser) {
        Object.assign(this.currentUser, updates);
      }

      console.log("User profile updated:", user.uid);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * UID로 사용자 데이터를 가져옵니다
   *
   * @param {string} uid - 사용자 UID
   * @returns {Promise<ChatUser | null>} 사용자 데이터 또는 null
   *
   * @example
   * const userData = await userService.getUserData('user123');
   */
  async getUserData(uid: string): Promise<ChatUser | null> {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        uid,
        displayName: data.displayName || "Anonymous",
        photoURL: data.photoURL || "",
        preferredLanguage: data.preferredLanguage || "ko",
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen || Date.now(),
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  /**
   * 여러 사용자의 데이터를 가져옵니다
   *
   * @param {string[]} uids - 사용자 UID 배열
   * @returns {Promise<Record<string, ChatUser>>} UID를 키로 사용한 사용자 데이터 객체
   *
   * @example
   * const users = await userService.getMultipleUsersData(['user1', 'user2']);
   */
  async getMultipleUsersData(
    uids: string[]
  ): Promise<Record<string, ChatUser>> {
    const users: Record<string, ChatUser> = {};

    const promises = uids.map(async (uid) => {
      const userData = await this.getUserData(uid);
      if (userData) {
        users[uid] = userData;
      }
    });

    await Promise.allSettled(promises);
    return users;
  }

  /**
   * 사용자 온라인 상태 변경을 구독합니다
   *
   * @param {string[]} uids - 구독할 사용자 UID 배열
   * @param {Function} callback - 상태 변경 시 호출될 콜백 함수
   * @returns {Function} 구독 해제 함수
   *
   * @example
   * const unsubscribe = userService.subscribeToUserPresence(['user1', 'user2'], (users) => {
   *   console.log('Users online:', users);
   * });
   */
  subscribeToUserPresence(
    uids: string[],
    callback: (users: Record<string, ChatUser>) => void
  ): () => void {
    if (uids.length === 0) {
      callback({});
      return () => {};
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("__name__", "in", uids));

    return onSnapshot(
      q,
      (snapshot) => {
        const users: Record<string, ChatUser> = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          users[doc.id] = {
            uid: doc.id,
            displayName: data.displayName || "Anonymous",
            photoURL: data.photoURL || "",
            preferredLanguage: data.preferredLanguage || "ko",
            isOnline: data.isOnline || false,
            lastSeen: data.lastSeen || Date.now(),
          };
        });

        callback(users);
      },
      (error) => {
        console.error("Error listening to user presence:", error);
        callback({});
      }
    );
  }

  /**
   * 현재 사용자 데이터를 반환합니다
   *
   * @returns {ChatUser | null} 현재 사용자 데이터 또는 null
   *
   * @example
   * const currentUser = userService.getCurrentUser();
   */
  getCurrentUser(): ChatUser | null {
    return this.currentUser;
  }

  /**
   * 사용자가 인증되었는지 확인합니다
   *
   * @returns {boolean} 인증된 경우 true, 그렇지 않으면 false
   *
   * @example
   * const isAuth = userService.isAuthenticated();
   */
  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * 비밀번호 재설정 이메일을 보냅니다
   *
   * @param {string} email - 비밀번호 재설정할 이메일
   * @returns {Promise<void>} 이메일 전송 완료 시 반환
   *
   * @example
   * await userService.sendPasswordResetEmail('user@example.com');
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent:", email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  /**
   * 이메일 인증을 다시 보냅니다
   *
   * @returns {Promise<void>} 이메일 재전송 완료 시 반환
   *
   * @example
   * await userService.resendEmailVerification();
   */
  async resendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");

      await sendEmailVerification(user);
      console.log("Email verification sent:", user.email);
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  }

  /**
   * 오프라인 감지를 위한 설정을 합니다
   *
   * @description
   * - 앱이 닫히기 전에 사용자를 오프라인으로 업데이트
   * - 앱이 보이기 시작할 때 사용자를 온라인으로 업데이트
   * - 정기적으로 온라인 상태 업데이트
   */
  setupOfflineDetection(): void {
    // Update user as offline when app is about to be closed
    window.addEventListener("beforeunload", () => {
      if (this.currentUser) {
        // Note: This might not always work due to browser limitations
        navigator.sendBeacon(
          "/api/offline",
          JSON.stringify({ uid: this.currentUser.uid })
        );
      }
    });

    // Update user as online when app becomes visible
    document.addEventListener("visibilitychange", () => {
      if (this.currentUser) {
        const isOnline = !document.hidden;
        this.updateUserPresence(this.currentUser.uid, isOnline);
      }
    });

    // Setup periodic presence updates
    setInterval(() => {
      if (this.currentUser && this.currentUser.isOnline) {
        this.updateUserPresence(this.currentUser.uid, true);
      }
    }, 30000); // Update every 30 seconds
  }
}

// Export singleton instance
export const userService = UserService.getInstance();
