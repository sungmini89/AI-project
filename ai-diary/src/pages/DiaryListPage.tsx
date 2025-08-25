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
import { useApp } from "../contexts/AppContext";

/**
 * 일기 목록 페이지 컴포넌트
 *
 * 사용자가 작성한 모든 일기를 목록 형태로 표시하고 관리할 수 있습니다.
 * 검색, 정렬, 편집, 삭제 등의 기능을 제공하며, 날짜별로 일기를 확인할 수 있습니다.
 *
 * 주요 기능:
 * - 일기 목록 표시 및 페이징
 * - 제목/내용/날짜 기반 검색
 * - 날짜별 정렬 (최신순/오래된순)
 * - 일기 편집 및 삭제
 * - 다크모드/라이트모드 지원
 * - 한국어/영어 다국어 지원
 *
 * @returns 일기 목록 페이지 JSX
 */
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
  const { language, isDark } = useApp();

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterAndSortEntries();
  }, [entries, searchTerm, selectedEmotion, sortBy, sortOrder]);

  /**
   * 데이터베이스에서 모든 일기 항목을 로드합니다.
   * 로딩 상태를 관리하고 에러 처리를 포함합니다.
   */
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

  /**
   * 검색어와 정렬 기준에 따라 일기 목록을 필터링하고 정렬합니다.
   * 제목, 내용, 날짜를 포함한 종합 검색을 지원합니다.
   */
  const filterAndSortEntries = () => {
    let filtered = entries.filter((entry) => {
      // 날짜 검색 지원
      const matchesSearch =
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matchesDateSearch(searchTerm, entry.createdAt);

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

  /**
   * 검색어가 날짜 형식과 일치하는지 확인합니다.
   * MM/DD, MM월 DD일, YYYY-MM-DD 등의 다양한 날짜 형식을 지원합니다.
   *
   * @param searchTerm - 검색어
   * @param entryDate - 일기 작성 날짜
   * @returns 날짜 매치 여부
   */
  const matchesDateSearch = (searchTerm: string, entryDate: Date): boolean => {
    if (!searchTerm.trim()) return false;

    const searchLower = searchTerm.toLowerCase().trim();
    const entryDateObj = new Date(entryDate);

    console.log("날짜 검색 시도:", {
      searchTerm: searchLower,
      entryDate: entryDateObj,
    });

    // MM/DD 형식 (예: 8/22, 08/22)
    const mmddPattern = /^(\d{1,2})\/(\d{1,2})$/;
    const mmddMatch = searchLower.match(mmddPattern);

    if (mmddMatch) {
      const month = parseInt(mmddMatch[1]);
      const day = parseInt(mmddMatch[2]);

      console.log("MM/DD 패턴 매치:", {
        month,
        day,
        entryMonth: entryDateObj.getMonth() + 1,
        entryDay: entryDateObj.getDate(),
      });

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const entryMonth = entryDateObj.getMonth() + 1;
        const entryDay = entryDateObj.getDate();

        if (entryMonth === month && entryDay === day) {
          console.log("MM/DD 날짜 매치 성공!");
          return true;
        }
      }
    }

    // MM월 DD일 형식 (예: 8월 22일, 08월 22일)
    const koreanPattern = /^(\d{1,2})월\s*(\d{1,2})일$/;
    const koreanMatch = searchLower.match(koreanPattern);

    if (koreanMatch) {
      const month = parseInt(koreanMatch[1]);
      const day = parseInt(koreanMatch[2]);

      console.log("한국어 패턴 매치:", {
        month,
        day,
        entryMonth: entryDateObj.getMonth() + 1,
        entryDay: entryDateObj.getDate(),
      });

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const entryMonth = entryDateObj.getMonth() + 1;
        const entryDay = entryDateObj.getDate();

        if (entryMonth === month && entryDay === day) {
          console.log("한국어 날짜 매치 성공!");
          return true;
        }
      }
    }

    // YYYY-MM-DD 형식 (예: 2024-08-22)
    const fullPattern = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const fullMatch = searchLower.match(fullPattern);

    if (fullMatch) {
      const month = parseInt(fullMatch[2]);
      const day = parseInt(fullMatch[3]);

      console.log("전체 날짜 패턴 매치:", {
        month,
        day,
        entryMonth: entryDateObj.getMonth() + 1,
        entryDay: entryDateObj.getDate(),
      });

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const entryMonth = entryDateObj.getMonth() + 1;
        const entryDay = entryDateObj.getDate();

        if (entryMonth === month && entryDay === day) {
          console.log("전체 날짜 매치 성공!");
          return true;
        }
      }
    }

    console.log("날짜 매치 실패");
    return false;
  };

  const handleEntryClick = (entryId: string) => {
    navigate(`/write/${entryId}`);
  };

  /**
   * 일기 편집 페이지로 이동합니다.
   *
   * @param entry - 편집할 일기 항목
   */
  const handleEditEntry = (entryId: string) => {
    navigate(`/write/${entryId}`);
  };

  /**
   * 특정 일기를 삭제합니다.
   * 사용자에게 확인을 요청한 후 데이터베이스에서 삭제합니다.
   *
   * @param entryId - 삭제할 일기의 ID
   */
  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
      try {
        await databaseService.deleteEntry(entryId);
        toast.success("일기가 삭제되었습니다.");
        loadEntries();
      } catch (error) {
        console.error("일기 삭제 실패:", error);
        toast.error("일기 삭제에 실패했습니다.");
      }
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

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map((entry) => entry.id)));
    }
  };

  const handleExportSelected = async () => {
    if (selectedEntries.size === 0) return;

    try {
      const selectedEntriesData = entries.filter((entry) =>
        selectedEntries.has(entry.id)
      );
      const exportData = {
        entries: selectedEntriesData,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diary-entries-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${selectedEntries.size}개의 일기를 내보냈습니다.`);
    } catch (error) {
      console.error("일기 내보내기 실패:", error);
      toast.error("일기 내보내기에 실패했습니다.");
    }
  };

  const handleImportFile = async () => {
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
      <div
        className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              {language === "ko"
                ? "일기 목록을 불러오는 중..."
                : "Loading diary list..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDark ? "dark" : "light"}`}>
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "일기 목록" : "Diary List"}
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {language === "ko"
                ? "모든 일기를 한눈에 확인하세요"
                : "View all your diaries at a glance"}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{language === "ko" ? "새 일기" : "New Diary"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div
        className={`rounded-xl shadow-sm border p-6 mb-6 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  language === "ko"
                    ? "일기 내용, 제목 또는 날짜로 검색... (예: 8/22, 8월 22일)"
                    : "Search by diary content, title, or date... (e.g., 8/22, Aug 22)"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>

          {/* 감정 필터 */}
          <div>
            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">
                {language === "ko" ? "모든 감정" : "All Emotions"}
              </option>
              <option value="happy">
                {language === "ko" ? "기쁨" : "Happy"}
              </option>
              <option value="sad">{language === "ko" ? "슬픔" : "Sad"}</option>
              <option value="angry">
                {language === "ko" ? "분노" : "Angry"}
              </option>
              <option value="neutral">
                {language === "ko" ? "중성" : "Neutral"}
              </option>
              <option value="excited">
                {language === "ko" ? "흥분" : "Excited"}
              </option>
              <option value="calm">
                {language === "ko" ? "평온" : "Calm"}
              </option>
              <option value="anxious">
                {language === "ko" ? "불안" : "Anxious"}
              </option>
              <option value="proud">
                {language === "ko" ? "자부심" : "Proud"}
              </option>
              <option value="disappointed">
                {language === "ko" ? "실망" : "Disappointed"}
              </option>
              <option value="grateful">
                {language === "ko" ? "감사" : "Grateful"}
              </option>
            </select>
          </div>

          {/* 정렬 */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "emotion" | "length")
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="date">
                {language === "ko" ? "날짜순" : "By Date"}
              </option>
              <option value="emotion">
                {language === "ko" ? "감정순" : "By Emotion"}
              </option>
              <option value="length">
                {language === "ko" ? "길이순" : "By Length"}
              </option>
            </select>
          </div>
        </div>

        {/* 정렬 순서 */}
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => setSortOrder("desc")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortOrder === "desc"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {language === "ko" ? "내림차순" : "Descending"}
          </button>
          <button
            onClick={() => setSortOrder("asc")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortOrder === "asc"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {language === "ko" ? "오름차순" : "Ascending"}
          </button>
        </div>
      </div>

      {/* 선택 및 액션 */}
      {filteredEntries.length > 0 && (
        <div
          className={`rounded-lg shadow-sm border p-4 mb-6 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEntries.size === filteredEntries.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {language === "ko" ? "전체 선택" : "Select All"}
                </span>
              </label>

              <span
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {language === "ko"
                  ? `${selectedEntries.size}개 선택됨`
                  : `${selectedEntries.size} selected`}
              </span>
            </div>

            {selectedEntries.size > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleExportSelected}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === "ko" ? "내보내기" : "Export"}</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === "ko" ? "삭제" : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 일기 목록 */}
      {filteredEntries.length === 0 ? (
        <div
          className={`rounded-lg border p-12 text-center ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="text-6xl mb-4">📝</div>
          <h3
            className={`text-lg font-medium mb-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {language === "ko" ? "일기가 없습니다" : "No diaries found"}
          </h3>
          <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {searchTerm || selectedEmotion !== "all"
              ? language === "ko"
                ? "검색 조건에 맞는 일기가 없습니다."
                : "No diaries match your search criteria."
              : language === "ko"
              ? "첫 번째 일기를 작성해보세요!"
              : "Write your first diary!"}
          </p>
          {!searchTerm && selectedEmotion === "all" && (
            <button
              onClick={() => navigate("/write")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>{language === "ko" ? "일기 작성하기" : "Write Diary"}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg border p-6 hover:shadow-sm transition-shadow ${
                isDark
                  ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
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
                    <div
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {format(
                        new Date(entry.createdAt),
                        language === "ko"
                          ? "yyyy년 MM월 dd일 EEEE"
                          : "EEEE, MMMM dd, yyyy",
                        { locale: language === "ko" ? ko : undefined }
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEntryClick(entry.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={language === "ko" ? "보기" : "View"}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEditEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title={language === "ko" ? "편집" : "Edit"}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={language === "ko" ? "삭제" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {entry.title ||
                    (language === "ko" ? "제목 없음" : "No Title")}
                </h3>
                <p
                  className={`line-clamp-3 ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
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
                  <span
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {entry.emotionAnalysis?.primaryEmotion || "neutral"}
                  </span>
                </div>

                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {language === "ko"
                    ? `${entry.content.length}자`
                    : `${entry.content.length} characters`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg p-6 max-w-md w-full mx-4 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "일기 삭제 확인" : "Confirm Deletion"}
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {language === "ko"
                ? `선택된 ${selectedEntries.size}개의 일기를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
                : `Are you sure you want to delete ${selectedEntries.size} selected diaries? This action cannot be undone.`}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {language === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                onClick={async () => {
                  try {
                    for (const entryId of selectedEntries) {
                      await databaseService.deleteEntry(entryId);
                    }
                    toast.success(
                      language === "ko"
                        ? `${selectedEntries.size}개의 일기가 삭제되었습니다.`
                        : `${selectedEntries.size} diaries have been deleted.`
                    );
                    setSelectedEntries(new Set());
                    setShowDeleteConfirm(false);
                    loadEntries();
                  } catch (error) {
                    console.error("일기 삭제 실패:", error);
                    toast.error(
                      language === "ko"
                        ? "일기 삭제에 실패했습니다."
                        : "Failed to delete diaries."
                    );
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {language === "ko" ? "삭제" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`rounded-lg p-6 max-w-md w-full mx-4 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {language === "ko" ? "일기 가져오기" : "Import Diaries"}
            </h3>
            <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {language === "ko"
                ? "JSON 형식의 일기 파일을 선택하세요."
                : "Select a JSON file containing diary entries."}
            </p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className={`w-full mb-4 p-2 border rounded-lg ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {language === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                onClick={handleImportFile}
                disabled={!importFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === "ko" ? "가져오기" : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryListPage;
