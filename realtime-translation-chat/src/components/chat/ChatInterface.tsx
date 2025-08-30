/**
 * @fileoverview 실시간 번역 채팅 인터페이스 컴포넌트
 *
 * 이 컴포넌트는 사용자가 채팅방에서 메시지를 주고받고,
 * 실시간으로 번역을 확인할 수 있는 메인 채팅 인터페이스입니다.
 *
 * @author 실시간 번역 채팅 팀
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { chatService } from "@/lib/services/chatService";
import { userService } from "@/lib/services/userService";
import type { ChatMessage, ChatRoom, ChatUser } from "@/types";
import {
  LogOut,
  Users,
  Plus,
  Settings,
  Menu,
  ArrowLeft,
  Globe,
  Home,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 채팅 인터페이스 컴포넌트의 props 인터페이스
 */
interface ChatInterfaceProps {
  /** Firebase 인증된 사용자 객체 */
  user: User;
}

/**
 * 실시간 번역 채팅 인터페이스 컴포넌트
 *
 * @description
 * - 사용자의 채팅방 목록 관리
 * - 실시간 메시지 송수신 및 번역
 * - 반응형 레이아웃 지원 (모바일/데스크톱)
 * - 타이핑 인디케이터 표시
 * - 채팅방 참여자 관리
 *
 * @param {ChatInterfaceProps} props - 컴포넌트 props
 * @returns {JSX.Element} 채팅 인터페이스 UI
 */
export default function ChatInterface({ user }: ChatInterfaceProps) {
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomUsers, setRoomUsers] = useState<Record<string, ChatUser>>({});
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize current user data
  useEffect(() => {
    const userData = userService.getCurrentUser();
    if (userData) {
      setCurrentUser(userData);
    }
  }, [user]);

  // Handle responsive layout changes
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setShowBackButton(isMobile);
      if (!isMobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Subscribe to user's rooms
  useEffect(() => {
    const unsubscribe = chatService.subscribeToUserRooms(
      user.uid,
      (userRooms) => {
        console.log("🏠 Rooms updated:", {
          userUid: user.uid,
          userEmail: user.email,
          userDisplayName: user.displayName,
          roomCount: userRooms.length,
          rooms: userRooms.map((room) => ({
            id: room.id,
            name: room.name,
            createdBy: room.createdBy,
            isMyRoom: room.createdBy === user.uid,
          })),
        });
        setRooms(userRooms);
        // Auto-select first room if no room selected
        if (userRooms.length > 0 && !currentRoom) {
          setCurrentRoom(userRooms[0]);
        }
      }
    );

    return () => unsubscribe();
  }, [user.uid, currentRoom]);

  // Subscribe to messages in current room
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(
      currentRoom.id,
      (roomMessages) => {
        console.log("🎯 UI received messages:", {
          roomId: currentRoom.id,
          messageCount: roomMessages.length,
          messages: roomMessages.map((m) => ({
            id: m.id,
            text: m.originalText,
            user: m.userName,
          })),
        });
        setMessages(roomMessages);
        scrollToBottom();
      },
      100 // Load last 100 messages
    );

    return () => unsubscribe();
  }, [currentRoom]);

  // Subscribe to room users presence
  useEffect(() => {
    if (!currentRoom) {
      setRoomUsers({});
      return;
    }

    const unsubscribe = userService.subscribeToUserPresence(
      currentRoom.participants,
      (users) => {
        setRoomUsers(users);
      }
    );

    return () => unsubscribe();
  }, [currentRoom]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!currentRoom || !user.uid) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = chatService.subscribeToTypingIndicators(
      currentRoom.id,
      user.uid,
      (users) => {
        setTypingUsers(users);
      }
    );

    return () => unsubscribe();
  }, [currentRoom, user.uid]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (text: string, targetLanguages: string[]) => {
    if (!currentRoom || !user) {
      console.error("❌ Cannot send message: missing room or user data", {
        currentRoom,
        user,
      });
      return;
    }

    // Use user prop directly for more reliable user data
    const userName =
      user.displayName || user.email || `User_${user.uid.slice(-4)}`;

    console.log("💬 Attempting to send message:", {
      text,
      targetLanguages,
      roomId: currentRoom.id,
      userId: user.uid,
      userName,
    });

    setIsLoading(true);
    // Clear typing indicator when sending message
    handleStopTyping();

    try {
      const messageId = await chatService.sendMessage(
        currentRoom.id,
        user.uid,
        userName,
        text,
        targetLanguages
      );
      console.log("✅ Message sent successfully with ID:", messageId);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      alert("메시지 전송에 실패했습니다: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTyping = () => {
    if (!currentRoom || !user) return;

    const userName =
      user.displayName || user.email || `User_${user.uid.slice(-4)}`;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    chatService.sendTypingIndicator(currentRoom.id, user.uid, userName, true);

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!currentRoom || !user) return;

    const userName =
      user.displayName || user.email || `User_${user.uid.slice(-4)}`;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    chatService.sendTypingIndicator(currentRoom.id, user.uid, userName, false);
  };

  const handleCreateRoom = async () => {
    const roomName = prompt("방 이름을 입력하세요:");
    if (!roomName?.trim()) return;

    try {
      const roomId = await chatService.createRoom(
        roomName.trim(),
        user.uid,
        ["ko", "en", "ja", "zh"] // Default supported languages
      );
      console.log("Room created:", roomId);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("방 생성에 실패했습니다.");
    }
  };

  const handleSignOut = async () => {
    try {
      await userService.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const getOnlineUsersCount = () => {
    return Object.values(roomUsers).filter((user) => user.isOnline).length;
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setCurrentRoom(room);
    setIsMobileSidebarOpen(false);
  };

  const handleBackToRooms = () => {
    if (showBackButton) {
      setCurrentRoom(null);
    }
  };

  const handleOpenSettings = () => {
    navigate("/settings");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleDeleteRoom = async (room: ChatRoom) => {
    console.log("🗑️ HandleDeleteRoom called for:", {
      roomName: room.name,
      roomId: room.id,
      createdBy: room.createdBy,
      currentUser: user.uid,
      canDelete: room.createdBy === user.uid,
      hasCreatedBy: room.createdBy !== undefined,
    });

    // Check if createdBy field exists (for legacy rooms)
    if (!room.createdBy) {
      const shouldProceed = window.confirm(
        `"${room.name}" 방은 생성자 정보가 없는 기존 방입니다.\n\n삭제하시겠습니까? (모든 참여자가 삭제할 수 있습니다)`
      );
      if (!shouldProceed) return;
    } else {
      // Check permission for rooms with createdBy field
      if (room.createdBy !== user.uid) {
        alert(
          `방 삭제 권한이 없습니다. 방을 만든 사용자만 삭제할 수 있습니다.\n\n방 만든이: ${room.createdBy}\n현재 사용자: ${user.uid}`
        );
        return;
      }
    }

    const confirmDelete = window.confirm(
      `"${room.name}" 방을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 방의 모든 메시지가 삭제됩니다.`
    );

    if (!confirmDelete) return;

    try {
      await chatService.deleteRoom(room.id, user.uid);

      // If the deleted room was the current room, clear it
      if (currentRoom?.id === room.id) {
        setCurrentRoom(null);
      }

      console.log("✅ Room deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete room:", error);
      alert(`방 삭제 실패: ${(error as Error).message}`);
    }
  };

  // Sidebar content component for reuse
  const SidebarContent = () => (
    <div className="h-full bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">번역 채팅</h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCreateRoom}
              title="새 방 만들기"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentUser?.displayName} (
          {currentUser?.preferredLanguage?.toUpperCase()})
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Globe className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p className="mb-2">참여 중인 방이 없습니다</p>
            <Button onClick={handleCreateRoom} size="sm" className="mt-2">
              첫 방 만들기
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "rounded-lg mb-2 transition-colors border",
                  "hover:bg-accent focus-within:bg-accent",
                  currentRoom?.id === room.id && "bg-accent border-primary"
                )}
              >
                <div className="flex items-center">
                  <button
                    onClick={() => handleRoomSelect(room)}
                    className="flex-1 text-left p-3 focus:outline-none"
                  >
                    <div className="font-medium truncate">{room.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>{room.participants.length}명 참여</span>
                      <div className="flex gap-1">
                        {room.supportedLanguages.slice(0, 3).map((lang) => (
                          <span key={lang} className="text-xs opacity-60">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                        {room.supportedLanguages.length > 3 && (
                          <span className="text-xs opacity-60">
                            +{room.supportedLanguages.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mr-2 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(
                        "🔍 Delete button clicked for room:",
                        room.name,
                        "createdBy:",
                        room.createdBy,
                        "currentUser:",
                        user.uid,
                        "canDelete:",
                        room.createdBy === user.uid
                      );
                      handleDeleteRoom(room);
                    }}
                    title={
                      room.createdBy === user.uid
                        ? "방 삭제"
                        : `삭제 불가 (만든이: ${room.createdBy})`
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Room List View - when no room selected */}
        {!currentRoom && showBackButton ? (
          <div className="flex-1">
            <div className="p-4 border-b bg-card">
              <h1 className="text-lg font-semibold">채팅방 목록</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rooms.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Globe className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p className="mb-2">참여 중인 방이 없습니다</p>
                  <Button onClick={handleCreateRoom} size="sm" className="mt-2">
                    첫 방 만들기
                  </Button>
                </div>
              ) : (
                <div className="p-2">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border-b hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => handleRoomSelect(room)}
                          className="flex-1 text-left p-4 focus:outline-none"
                        >
                          <div className="font-medium truncate mb-1">
                            {room.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center justify-between">
                            <span>{room.participants.length}명 참여</span>
                            <div className="flex gap-1">
                              {room.supportedLanguages
                                .slice(0, 3)
                                .map((lang) => (
                                  <span
                                    key={lang}
                                    className="text-xs opacity-60"
                                  >
                                    {lang.toUpperCase()}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 mr-2 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "🔍 Mobile delete button clicked for room:",
                              room.name,
                              "createdBy:",
                              room.createdBy,
                              "currentUser:",
                              user.uid,
                              "canDelete:",
                              room.createdBy === user.uid
                            );
                            handleDeleteRoom(room);
                          }}
                          title={
                            room.createdBy === user.uid
                              ? "방 삭제"
                              : `삭제 불가 (만든이: ${room.createdBy})`
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-card">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {currentUser?.displayName}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGoHome} variant="outline" size="sm">
                    <Home className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleCreateRoom} size="sm">
                    <Plus className="h-4 w-4 mr-1" />새 방
                  </Button>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showBackButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToRooms}
                      className="md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  {!showBackButton && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="md:hidden"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold truncate">
                      {currentRoom.name}
                    </h2>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getOnlineUsersCount()}/{currentRoom.participants.length}{" "}
                      온라인
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleGoHome}
                    title="홈으로"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenSettings}
                    title="설정"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Supported languages */}
              <div className="mt-2 flex flex-wrap gap-1">
                {currentRoom.supportedLanguages.map((langCode) => (
                  <span
                    key={langCode}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                  >
                    {langCode.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>아직 메시지가 없습니다</p>
                  <p className="text-sm">첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.userId === user.uid}
                    userPreferredLanguage={
                      currentUser?.preferredLanguage || "ko"
                    }
                  />
                ))
              )}
              {/* Typing Indicator */}
              <TypingIndicator users={typingUsers} />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onUserTyping={handleUserTyping}
              onStopTyping={handleStopTyping}
              disabled={isLoading}
              supportedLanguages={currentRoom.supportedLanguages}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="md:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  방을 선택하세요
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {showBackButton ? "위의 메뉴를 눌러" : "왼쪽에서"} 방을
                  선택하거나 새 방을 만들어보세요
                </p>
                <Button onClick={handleCreateRoom} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />새 방 만들기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
