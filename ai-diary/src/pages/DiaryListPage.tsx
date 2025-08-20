import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Plus,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { DiaryEntry } from "../services/databaseService";
import { databaseService } from "../services/databaseService";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const DiaryListPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "emotion" | "length">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set()
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchTerm, selectedEmotion, sortBy, sortOrder]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const allEntries = await databaseService.getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error("일기 목록 로드 실패:", error);
      toast.error("일기 목록을 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortEntries = () => {
    let filtered = entries.filter((entry) => {
      const matchesSearch =
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmotion =
        selectedEmotion === "all" ||
        entry.emotionAnalysis?.primaryEmotion === selectedEmotion;
      return matchesSearch && matchesEmotion;
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "emotion":
          comparison = (a.emotionAnalysis?.primaryEmotion || "").localeCompare(
            b.emotionAnalysis?.primaryEmotion || ""
          );
          break;
        case "length":
          comparison = a.content.length - b.content.length;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredEntries(filtered);
  };

  const handleEntryClick = (entryId: string) => {
    navigate(`/write/${entryId}`);
  };

  const handleEditEntry = (entryId: string) => {
    navigate(`/write/${entryId}`);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await databaseService.deleteEntry(entryId);
      toast.success("일기가 삭제되었습니다.");
      loadEntries();
    } catch (error) {
      console.error("일기 삭제 실패:", error);
      toast.error("일기 삭제에 실패했습니다.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const entryId of selectedEntries) {
        await databaseService.deleteEntry(entryId);
      }
      toast.success(`${selectedEntries.size}개의 일기가 삭제되었습니다.`);
      setSelectedEntries(new Set());
      setShowDeleteConfirm(false);
      loadEntries();
    } catch (error) {
      console.error("일괄 삭제 실패:", error);
      toast.error("일괄 삭제에 실패했습니다.");
    }
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map((entry) => entry.id)));
    }
  };

  const handleEntrySelect = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleExportSelected = async () => {
    if (selectedEntries.size === 0) {
      toast.error("내보낼 일기를 선택해주세요.");
      return;
    }

    try {
      const selectedEntriesData = entries.filter((entry) =>
        selectedEntries.has(entry.id)
      );
      const exportData = {
        entries: selectedEntriesData,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-diary-entries-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("선택된 일기가 내보내졌습니다.");
    } catch (error) {
      console.error("일기 내보내기 실패:", error);
      toast.error("일기 내보내기에 실패했습니다.");
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setImportFile(file);
    } else {
      toast.error("올바른 JSON 파일을 선택해주세요.");
    }
  };

  const handleImportEntries = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const importData = JSON.parse(text);

      if (importData.entries && Array.isArray(importData.entries)) {
        let importedCount = 0;
        for (const entry of importData.entries) {
          try {
            await databaseService.addEntry(entry);
            importedCount++;
          } catch (error) {
            console.error("개별 일기 가져오기 실패:", error);
          }
        }

        toast.success(`${importedCount}개의 일기를 가져왔습니다.`);
        setImportFile(null);
        setShowImportModal(false);
        loadEntries();
      } else {
        toast.error("올바른 형식의 파일이 아닙니다.");
      }
    } catch (error) {
      console.error("파일 가져오기 실패:", error);
      toast.error("파일을 가져올 수 없습니다.");
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "#10b981",
      sad: "#6b7280",
      angry: "#ef4444",
      neutral: "#9ca3af",
      excited: "#f59e0b",
      calm: "#3b82f6",
      anxious: "#8b5cf6",
      proud: "#ec4899",
      disappointed: "#dc2626",
      grateful: "#059669",
    };
    return colors[emotion] || "#6b7280";
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      neutral: "😐",
      excited: "🤩",
      calm: "😌",
      anxious: "😰",
      proud: "😎",
      disappointed: "😞",
      grateful: "🙏",
    };
    return emojis[emotion] || "😐";
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">일기 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">일기 목록</h1>
            <p className="text-lg text-gray-600">
              작성한 모든 일기를 확인하고 관리할 수 있습니다.
            </p>
          </div>

          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>새 일기 작성</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span>가져오기</span>
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="일기 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 감정 필터 */}
            <div className="relative">
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">모든 감정</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
                <option value="neutral">Neutral</option>
                <option value="excited">Excited</option>
                <option value="calm">Calm</option>
                <option value="anxious">Anxious</option>
                <option value="proud">Proud</option>
                <option value="disappointed">Disappointed</option>
                <option value="grateful">Grateful</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* 정렬 */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "emotion" | "length")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="date">날짜순</option>
                  <option value="emotion">감정순</option>
                  <option value="length">길이순</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* 선택 및 액션 */}
        {filteredEntries.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedEntries.size === filteredEntries.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    전체 선택
                  </span>
                </label>

                <span className="text-sm text-gray-500">
                  {selectedEntries.size}개 선택됨
                </span>
              </div>

              {selectedEntries.size > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportSelected}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>내보내기</span>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 일기 목록 */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            일기가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedEmotion !== "all"
              ? "검색 조건에 맞는 일기가 없습니다."
              : "첫 번째 일기를 작성해보세요!"}
          </p>
          {!searchTerm && selectedEmotion === "all" && (
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>일기 작성하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => handleEntrySelect(entry.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-sm text-gray-500">
                      {format(
                        new Date(entry.createdAt),
                        "yyyy년 MM월 dd일 EEEE",
                        { locale: ko }
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEntryClick(entry.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="편집"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {entry.title || "제목 없음"}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {entry.content.length > 150
                    ? `${entry.content.substring(0, 150)}...`
                    : entry.content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="text-lg"
                    style={{
                      color: getEmotionColor(
                        entry.emotionAnalysis?.primaryEmotion || "neutral"
                      ),
                    }}
                  >
                    {getEmotionEmoji(
                      entry.emotionAnalysis?.primaryEmotion || "neutral"
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {entry.emotionAnalysis?.primaryEmotion || "neutral"}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{entry.content.length}자</span>
                  <span>
                    신뢰도:{" "}
                    {entry.emotionAnalysis
                      ? Math.round(entry.emotionAnalysis.confidence * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              일기 삭제
            </h3>
            <p className="text-gray-600 mb-2">
              정말로 {selectedEntries.size}개의 일기를 삭제하시겠습니까?
            </p>
            <p className="text-sm text-red-600 mb-6">
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              일기 가져오기
            </h3>
            <p className="text-gray-600 mb-4">
              JSON 파일에서 일기를 가져올 수 있습니다.
            </p>

            <div className="mb-6">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {importFile && (
                <p className="text-sm text-green-600 mt-2">
                  선택된 파일: {importFile.name}
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleImportEntries}
                disabled={!importFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                가져오기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryListPage;
