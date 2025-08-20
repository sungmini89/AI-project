import Dexie, { type Table } from "dexie";
import type {
  EmotionAnalysisResult,
  EmotionType,
} from "./emotionAnalysisService";

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  emotionAnalysis?: EmotionAnalysisResult | null;
}

export interface EmotionHistory {
  id: string;
  date: Date;
  emotion: EmotionType;
  score: number;
  entryId: string;
}

export interface Statistics {
  totalEntries: number;
  averageEmotionScore: number;
  mostFrequentEmotion: EmotionType;
  emotionDistribution: Record<EmotionType, number>;
  weeklyTrend: { date: string; score: number }[];
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  language: "ko" | "en";
  autoSave: boolean;
  autoSaveInterval: number;
  notifications: boolean;
  backupEnabled: boolean;
  backupInterval: number;
}

export interface BackupData {
  id?: number;
  timestamp: Date;
  data: {
    entries: DiaryEntry[];
    emotionHistory: EmotionHistory[];
    settings: AppSettings;
  };
  version: string;
}

class DatabaseService extends Dexie {
  entries!: Table<DiaryEntry>;
  emotionHistory!: Table<EmotionHistory>;
  settings!: Table<AppSettings>;
  backups!: Table<BackupData>;

  constructor() {
    super("AIDiaryDB");

    this.version(1).stores({
      entries: "id, createdAt, updatedAt",
      emotionHistory: "id, date, emotion, entryId",
      settings: "id",
      backups: "++id, timestamp",
    });

    this.on("ready", () => {
      this.initializeDefaultSettings();
    });
  }

  private async initializeDefaultSettings() {
    const existingSettings = await this.settings.get(1);
    if (!existingSettings) {
      await this.settings.add({
        theme: "auto",
        language: "ko",
        autoSave: true,
        autoSaveInterval: 30000,
        notifications: true,
        backupEnabled: true,
        backupInterval: 7,
      });
    }
  }

  // 일기 관련 메서드
  async addEntry(entry: DiaryEntry): Promise<string> {
    try {
      await this.entries.add(entry);

      // 감정 분석 결과가 있으면 히스토리에 추가
      if (entry.emotionAnalysis) {
        await this.emotionHistory.add({
          id: Date.now().toString(),
          date: entry.createdAt,
          emotion: entry.emotionAnalysis.primaryEmotion,
          score: entry.emotionAnalysis.score,
          entryId: entry.id,
        });
      }

      return entry.id;
    } catch (error) {
      console.error("일기 추가 실패:", error);
      throw new Error("일기를 저장할 수 없습니다.");
    }
  }

  async updateEntry(entry: DiaryEntry): Promise<void> {
    try {
      await this.entries.update(entry.id, entry);

      // 감정 분석 결과가 있으면 히스토리 업데이트
      if (entry.emotionAnalysis) {
        const existingHistory = await this.emotionHistory
          .where("entryId")
          .equals(entry.id)
          .first();

        if (existingHistory) {
          await this.emotionHistory.update(existingHistory.id, {
            emotion: entry.emotionAnalysis.primaryEmotion,
            score: entry.emotionAnalysis.score,
            date: entry.updatedAt,
          });
        } else {
          await this.emotionHistory.add({
            id: Date.now().toString(),
            date: entry.updatedAt,
            emotion: entry.emotionAnalysis.primaryEmotion,
            score: entry.emotionAnalysis.score,
            entryId: entry.id,
          });
        }
      }
    } catch (error) {
      console.error("일기 수정 실패:", error);
      throw new Error("일기를 수정할 수 없습니다.");
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      await this.entries.delete(id);

      // 관련 감정 히스토리도 삭제
      await this.emotionHistory.where("entryId").equals(id).delete();
    } catch (error) {
      console.error("일기 삭제 실패:", error);
      throw new Error("일기를 삭제할 수 없습니다.");
    }
  }

  async getEntry(id: string): Promise<DiaryEntry | undefined> {
    try {
      return await this.entries.get(id);
    } catch (error) {
      console.error("일기 조회 실패:", error);
      throw new Error("일기를 조회할 수 없습니다.");
    }
  }

  async getAllEntries(): Promise<DiaryEntry[]> {
    try {
      return await this.entries.orderBy("createdAt").reverse().toArray();
    } catch (error) {
      console.error("전체 일기 조회 실패:", error);
      throw new Error("일기 목록을 조회할 수 없습니다.");
    }
  }

  async getEntriesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<DiaryEntry[]> {
    try {
      return await this.entries
        .where("createdAt")
        .between(startDate, endDate)
        .toArray();
    } catch (error) {
      console.error("기간별 일기 조회 실패:", error);
      throw new Error("기간별 일기를 조회할 수 없습니다.");
    }
  }

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    try {
      const allEntries = await this.getAllEntries();
      const lowerQuery = query.toLowerCase();

      return allEntries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.content.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("일기 검색 실패:", error);
      throw new Error("일기 검색에 실패했습니다.");
    }
  }

  // 감정 히스토리 관련 메서드
  async getEmotionHistory(): Promise<EmotionHistory[]> {
    try {
      return await this.emotionHistory.orderBy("date").reverse().toArray();
    } catch (error) {
      console.error("감정 히스토리 조회 실패:", error);
      throw new Error("감정 히스토리를 조회할 수 없습니다.");
    }
  }

  async getEmotionHistoryByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<EmotionHistory[]> {
    try {
      return await this.emotionHistory
        .where("date")
        .between(startDate, endDate)
        .toArray();
    } catch (error) {
      console.error("기간별 감정 히스토리 조회 실패:", error);
      throw new Error("기간별 감정 히스토리를 조회할 수 없습니다.");
    }
  }

  async getEmotionHistoryByEmotion(
    emotion: EmotionType
  ): Promise<EmotionHistory[]> {
    try {
      return await this.emotionHistory
        .where("emotion")
        .equals(emotion)
        .sortBy("date")
        .then((entries) => entries.reverse());
    } catch (error) {
      console.error("감정별 히스토리 조회 실패:", error);
      throw new Error("감정별 히스토리를 조회할 수 없습니다.");
    }
  }

  // 통계 관련 메서드
  async getStatistics(): Promise<Statistics> {
    try {
      const entries = await this.getAllEntries();
      const emotionHistory = await this.getEmotionHistory();

      const totalEntries = entries.length;

      // 평균 감정 점수 계산
      const totalScore = emotionHistory.reduce(
        (sum, history) => sum + history.score,
        0
      );
      const averageEmotionScore =
        emotionHistory.length > 0 ? totalScore / emotionHistory.length : 0;

      // 감정 분포 계산
      const emotionDistribution: Record<EmotionType, number> = {
        happy: 0,
        sad: 0,
        angry: 0,
        neutral: 0,
        excited: 0,
        calm: 0,
        anxious: 0,
        proud: 0,
        disappointed: 0,
        grateful: 0,
      };

      emotionHistory.forEach((history) => {
        emotionDistribution[history.emotion]++;
      });

      // 가장 빈번한 감정
      const mostFrequentEmotion = Object.entries(emotionDistribution).reduce(
        (a, b) =>
          emotionDistribution[a[0] as EmotionType] >
          emotionDistribution[b[0] as EmotionType]
            ? a
            : b
      )[0] as EmotionType;

      // 주간 트렌드 계산
      const weeklyTrend = this.calculateWeeklyTrend(emotionHistory);

      return {
        totalEntries,
        averageEmotionScore,
        mostFrequentEmotion,
        emotionDistribution,
        weeklyTrend,
      };
    } catch (error) {
      console.error("통계 계산 실패:", error);
      throw new Error("통계를 계산할 수 없습니다.");
    }
  }

  private calculateWeeklyTrend(
    emotionHistory: EmotionHistory[]
  ): { date: string; score: number }[] {
    const weeklyData: { [key: string]: number[] } = {};

    emotionHistory.forEach((history) => {
      const weekStart = this.getWeekStart(history.date);
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(history.score);
    });

    return Object.entries(weeklyData)
      .map(([date, scores]) => ({
        date,
        score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // 설정 관련 메서드
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.settings.get(1);
      if (!settings) {
        throw new Error("설정을 찾을 수 없습니다.");
      }
      return settings;
    } catch (error) {
      console.error("설정 조회 실패:", error);
      throw new Error("설정을 조회할 수 없습니다.");
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      await this.settings.update(1, settings);
    } catch (error) {
      console.error("설정 업데이트 실패:", error);
      throw new Error("설정을 업데이트할 수 없습니다.");
    }
  }

  // 백업 관련 메서드
  async createBackup(): Promise<number> {
    try {
      const entries = await this.getAllEntries();
      const emotionHistory = await this.getEmotionHistory();
      const settings = await this.getSettings();

      const backupData: BackupData = {
        timestamp: new Date(),
        data: {
          entries,
          emotionHistory,
          settings,
        },
        version: "1.0.0",
      };

      const backupId = await this.backups.add(backupData);
      return backupId;
    } catch (error) {
      console.error("백업 생성 실패:", error);
      throw new Error("백업을 생성할 수 없습니다.");
    }
  }

  async restoreBackup(backupId: number): Promise<void> {
    try {
      const backup = await this.backups.get(backupId);
      if (!backup) {
        throw new Error("백업을 찾을 수 없습니다.");
      }

      // 기존 데이터 삭제
      await this.entries.clear();
      await this.emotionHistory.clear();
      await this.settings.clear();

      // 백업 데이터 복원
      await this.entries.bulkAdd(backup.data.entries);
      await this.emotionHistory.bulkAdd(backup.data.emotionHistory);
      await this.settings.add(backup.data.settings);
    } catch (error) {
      console.error("백업 복원 실패:", error);
      throw new Error("백업을 복원할 수 없습니다.");
    }
  }

  async getBackups(): Promise<BackupData[]> {
    try {
      return await this.backups.orderBy("timestamp").reverse().toArray();
    } catch (error) {
      console.error("백업 목록 조회 실패:", error);
      throw new Error("백업 목록을 조회할 수 없습니다.");
    }
  }

  async deleteBackup(backupId: number): Promise<void> {
    try {
      await this.backups.delete(backupId);
    } catch (error) {
      console.error("백업 삭제 실패:", error);
      throw new Error("백업을 삭제할 수 없습니다.");
    }
  }

  // 데이터베이스 관리 메서드
  async clearAllData(): Promise<void> {
    try {
      await this.entries.clear();
      await this.emotionHistory.clear();
      await this.settings.clear();
      await this.backups.clear();
    } catch (error) {
      console.error("데이터 초기화 실패:", error);
      throw new Error("데이터를 초기화할 수 없습니다.");
    }
  }

  async exportData(): Promise<string> {
    try {
      const entries = await this.getAllEntries();
      const emotionHistory = await this.getEmotionHistory();
      const settings = await this.getSettings();

      const exportData = {
        entries,
        emotionHistory,
        settings,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("데이터 내보내기 실패:", error);
      throw new Error("데이터를 내보낼 수 없습니다.");
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);

      if (
        !importData.entries ||
        !importData.emotionHistory ||
        !importData.settings
      ) {
        throw new Error("잘못된 데이터 형식입니다.");
      }

      // 기존 데이터 삭제
      await this.clearAllData();

      // 새 데이터 가져오기
      await this.entries.bulkAdd(importData.entries);
      await this.emotionHistory.bulkAdd(importData.emotionHistory);
      await this.settings.add(importData.settings);
    } catch (error) {
      console.error("데이터 가져오기 실패:", error);
      throw new Error("데이터를 가져올 수 없습니다.");
    }
  }
}

export const databaseService = new DatabaseService();
