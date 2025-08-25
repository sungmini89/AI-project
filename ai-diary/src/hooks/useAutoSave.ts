import { useEffect, useRef, useCallback } from "react";
import { databaseService, type AppSettings } from "../services/databaseService";
import { toast } from "react-hot-toast";

interface UseAutoSaveProps {
  title: string;
  content: string;
  entryId?: string;
  onSave?: () => void;
}

export const useAutoSave = ({ title, content, entryId, onSave }: UseAutoSaveProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef({ title: "", content: "" });
  const settingsRef = useRef<AppSettings | null>(null);

  // 설정 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await databaseService.getSettings();
        settingsRef.current = settings;
      } catch (error) {
        console.error("자동 저장 설정 로드 실패:", error);
      }
    };

    loadSettings();
  }, []);

  // 자동 저장 실행
  const performAutoSave = useCallback(async () => {
    const settings = settingsRef.current;
    if (!settings?.autoSave) return;

    // 내용이 변경되지 않았으면 저장하지 않음
    if (
      lastSavedRef.current.title === title &&
      lastSavedRef.current.content === content
    ) {
      return;
    }

    // 빈 내용은 저장하지 않음
    if (!title.trim() && !content.trim()) {
      return;
    }

    try {
      const diaryEntry = {
        id: entryId || Date.now().toString(),
        title: title.trim() || "무제",
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (entryId) {
        // 기존 엔트리 업데이트
        const existingEntry = await databaseService.getEntry(entryId);
        if (existingEntry) {
          await databaseService.updateEntry({
            ...existingEntry,
            title: diaryEntry.title,
            content: diaryEntry.content,
            updatedAt: diaryEntry.updatedAt,
          });
        }
      } else {
        // 새 엔트리 추가 (하지만 자동 저장에서는 신중하게)
        if (title.trim() || content.trim().length > 10) {
          await databaseService.addEntry(diaryEntry);
        }
      }

      // 저장된 내용을 기록
      lastSavedRef.current = { title, content };
      
      // 성공 시 콜백 호출
      onSave?.();

      // 조용한 성공 표시 (너무 자주 토스트가 뜨지 않도록)
      console.log("자동 저장 완료:", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("자동 저장 실패:", error);
      // 자동 저장 실패는 사용자에게 알리지 않음 (방해가 될 수 있음)
    }
  }, [title, content, entryId, onSave]);

  // 자동 저장 설정
  useEffect(() => {
    const settings = settingsRef.current;
    if (!settings?.autoSave) {
      // 자동 저장이 비활성화되면 기존 인터벌 제거
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 기존 인터벌 제거
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 새 인터벌 설정
    intervalRef.current = setInterval(
      performAutoSave,
      settings.autoSaveInterval || 30000
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performAutoSave]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 수동으로 자동 저장 트리거 (설정 변경 시 등)
  const triggerAutoSave = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  return {
    triggerAutoSave,
  };
};