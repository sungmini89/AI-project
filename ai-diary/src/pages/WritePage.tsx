import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { DiaryEntry } from "../services/databaseService";
import { databaseService } from "../services/databaseService";
import { emotionAnalysisService } from "../services/emotionAnalysisService";
import DiaryEditor from "../components/editor/DiaryEditor";
import { useApp } from "../contexts/AppContext";

const WritePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isDark } = useApp();
  const [entry, setEntry] = useState<DiaryEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async () => {
    try {
      setIsLoading(true);
      const loadedEntry = await databaseService.getEntry(id!);
      if (loadedEntry) {
        setEntry(loadedEntry);
      } else {
        toast.error(
          language === "ko" ? "일기를 찾을 수 없습니다." : "Diary not found."
        );
        navigate("/diary");
      }
    } catch (error) {
      console.error("일기 로드 실패:", error);
      toast.error(
        language === "ko"
          ? "일기를 불러올 수 없습니다."
          : "Failed to load diary."
      );
      navigate("/diary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (diaryEntry: DiaryEntry) => {
    try {
      // DiaryEditor에서 이미 저장이 완료되었으므로 추가 저장은 하지 않음
      // 단순히 페이지 이동만 처리
      if (id) {
        // 기존 일기 수정 - 이미 DiaryEditor에서 수정 완료
        navigate("/diary");
      } else {
        // 새 일기 작성 - 이미 DiaryEditor에서 저장 완료
        // 일기 목록 페이지로 이동하여 작성 칸 초기화
        navigate("/diary");
      }
    } catch (error) {
      console.error("onSave 콜백 실행 실패:", error);
      // 콜백 오류는 저장 성공에 영향을 주지 않음
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (
      !confirm(
        language === "ko"
          ? "정말로 이 일기를 삭제하시겠습니까?"
          : "Are you sure you want to delete this diary?"
      )
    ) {
      return;
    }

    try {
      await databaseService.deleteEntry(id);
      toast.success(
        language === "ko"
          ? "일기가 삭제되었습니다."
          : "Diary deleted successfully."
      );
      navigate("/diary");
    } catch (error) {
      console.error("일기 삭제 실패:", error);
      toast.error(
        language === "ko"
          ? "일기 삭제에 실패했습니다."
          : "Failed to delete diary."
      );
    }
  };

  if (isLoading) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              {language === "ko" ? "일기를 불러오는 중..." : "Loading diary..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}>
      <DiaryEditor
        entry={entry}
        onSave={handleSave}
        onCancel={() => navigate("/diary")}
      />
    </div>
  );
};

export default WritePage;
