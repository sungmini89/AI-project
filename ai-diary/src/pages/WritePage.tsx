import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { DiaryEntry } from "../services/databaseService";
import { databaseService } from "../services/databaseService";
import { emotionAnalysisService } from "../services/emotionAnalysisService";
import DiaryEditor from "../components/editor/DiaryEditor";

const WritePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        toast.error("일기를 찾을 수 없습니다.");
        navigate("/list");
      }
    } catch (error) {
      console.error("일기 로드 실패:", error);
      toast.error("일기를 불러올 수 없습니다.");
      navigate("/list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (diaryEntry: DiaryEntry) => {
    try {
      if (id) {
        // 기존 일기 수정
        await databaseService.updateEntry(diaryEntry);
        toast.success("일기가 수정되었습니다.");
        navigate("/list");
      } else {
        // 새 일기 작성
        const newId = await databaseService.addEntry(diaryEntry);
        toast.success("일기가 저장되었습니다.");
        navigate(`/write/${newId}`);
      }
    } catch (error) {
      console.error("일기 저장 실패:", error);
      toast.error("일기 저장에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await databaseService.deleteEntry(id);
      toast.success("일기가 삭제되었습니다.");
      navigate("/list");
    } catch (error) {
      console.error("일기 삭제 실패:", error);
      toast.error("일기 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="write-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>일기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="write-page">
      <DiaryEditor
        entry={entry}
        onSave={handleSave}
        onCancel={() => navigate("/list")}
      />
    </div>
  );
};

export default WritePage;
