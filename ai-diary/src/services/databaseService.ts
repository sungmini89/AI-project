import Dexie, { type Table } from "dexie";
import type { EmotionType } from "./emotionAnalysisService";

/**
 * 일기 항목 인터페이스
 * 사용자가 작성한 일기의 기본 정보와 감정 분석 결과를 포함합니다.
 */
export interface DiaryEntry {
  /** 고유 식별자 */
  id: string;
  /** 일기 제목 */
  title: string;
  /** 일기 내용 */
  content: string;
  /** 작성 시간 */
  createdAt: Date;
  /** 마지막 수정 시간 */
  updatedAt: Date;
  /** 감정 분석 결과 (선택사항) */
  emotionAnalysis?: EmotionAnalysisResult;
}

/**
 * 감정 분석 결과 인터페이스
 * AI 서비스를 통해 분석된 감정 정보를 포함합니다.
 */
export interface EmotionAnalysisResult {
  /** 주요 감정 */
  primaryEmotion: EmotionType;
  /** 감정 점수 (-5 ~ +5) */
  score: number;
  /** 긍정적 키워드들 */
  words: {
    positive: string[];
    negative: string[];
  };
  /** 분석 신뢰도 */
  confidence: number;
}

/**
 * 감정 히스토리 인터페이스
 * 날짜별 감정 분석 결과를 추적하기 위한 기록입니다.
 */
export interface EmotionHistory {
  /** 고유 식별자 */
  id?: number;
  /** 감정 분석 날짜 */
  date: Date;
  /** 감정 타입 */
  emotion: EmotionType;
  /** 감정 점수 */
  score: number;
  /** 관련 일기 ID */
  entryId: string;
}

/**
 * 통계 정보 인터페이스
 * 일기 데이터를 기반으로 계산된 종합적인 통계를 제공합니다.
 */
export interface Statistics {
  /** 총 일기 수 */
  totalEntries: number;
  /** 평균 감정 점수 */
  averageEmotionScore: number;
  /** 가장 빈번한 감정 */
  mostFrequentEmotion: EmotionType;
  /** 감정별 분포 */
  emotionDistribution: Record<EmotionType, number>;
  /** 주간 트렌드 데이터 */
  weeklyTrend: { date: string; score: number }[];
}

/**
 * 앱 설정 인터페이스
 * 사용자의 테마, 언어, 자동 저장 등의 개인 설정을 관리합니다.
 */
export interface AppSettings {
  /** 고유 식별자 */
  id?: number;
  /** 테마 설정 (라이트/다크) */
  theme: "light" | "dark";
  /** 언어 설정 (한국어/영어) */
  language: "ko" | "en";
  /** 자동 저장 활성화 여부 */
  autoSave: boolean;
  /** 자동 저장 간격 (밀리초) */
  autoSaveInterval: number;
  /** 알림 활성화 여부 */
  notifications: boolean;
  /** 백업 활성화 여부 */
  backupEnabled: boolean;
  /** 백업 간격 (일) */
  backupInterval: number;
}

/**
 * 백업 데이터 인터페이스
 * 데이터 백업 및 복원을 위한 구조입니다.
 */
export interface BackupData {
  /** 고유 식별자 */
  id?: number;
  /** 백업 생성 시간 */
  timestamp: Date;
  /** 백업된 데이터 */
  data: {
    entries: DiaryEntry[];
    emotionHistory: EmotionHistory[];
    settings: AppSettings;
  };
  /** 백업 버전 */
  version: string;
}

/**
 * 데이터베이스 서비스 클래스
 *
 * IndexedDB를 기반으로 한 클라이언트 사이드 데이터베이스 관리 서비스입니다.
 * Dexie.js를 사용하여 일기, 감정 분석, 설정, 백업 등의 데이터를 관리합니다.
 *
 * 주요 기능:
 * - 일기 CRUD 작업
 * - 감정 분석 결과 저장 및 조회
 * - 사용자 설정 관리
 * - 데이터 백업 및 복원
 * - 통계 데이터 생성
 */
class DatabaseService extends Dexie {
  /** 일기 테이블 */
  entries!: Table<DiaryEntry>;
  /** 감정 히스토리 테이블 */
  emotionHistory!: Table<EmotionHistory>;
  /** 설정 테이블 */
  settings!: Table<AppSettings>;
  /** 백업 테이블 */
  backups!: Table<BackupData>;

  constructor() {
    super("AIDiaryDB");

    // 단일 버전으로 통합하여 스키마 관리
    this.version(1)
      .stores({
        entries: "id, createdAt, updatedAt",
        emotionHistory: "id, date, emotion, entryId",
        settings: "++id",
        backups: "++id, timestamp",
      })
      .upgrade(async (tx) => {
        // 기존 설정 테이블 초기화
        await tx.table("settings").clear();

        // 기본 설정 추가 (id는 자동 생성)
        await tx.table("settings").add({
          theme: "light",
          language: "ko",
          autoSave: true,
          autoSaveInterval: 30000,
          notifications: true,
          backupEnabled: true,
          backupInterval: 7,
        });
      });

    // 데이터베이스 준비 완료 시 초기화
    this.on("ready", () => {
      this.initializeDefaultSettings();
    });
  }

  /**
   * 기본 설정을 초기화합니다.
   * 설정 테이블이 비어있을 때 기본값을 추가합니다.
   */
  private async initializeDefaultSettings() {
    try {
      const count = await this.settings.count();
      if (count === 0) {
        await this.settings.add({
          theme: "light",
          language: "ko",
          autoSave: true,
          autoSaveInterval: 30000,
          notifications: true,
          backupEnabled: true,
          backupInterval: 7,
        });
        console.log("기본 설정이 초기화되었습니다.");
      }
    } catch (error) {
      console.error("기본 설정 초기화 실패:", error);
    }
  }

  /**
   * 새로운 일기 항목을 데이터베이스에 추가합니다.
   * 감정 분석 결과가 있으면 감정 히스토리에도 함께 저장합니다.
   *
   * @param entry - 추가할 일기 데이터
   * @returns 생성된 일기의 ID
   */
  async addEntry(entry: DiaryEntry): Promise<string> {
    try {
      await this.entries.add(entry);

      // 감정 분석 결과가 있으면 히스토리에 추가 (실패해도 일기 저장은 성공)
      if (entry.emotionAnalysis) {
        try {
          await this.emotionHistory.add({
            date: entry.createdAt,
            emotion: entry.emotionAnalysis.primaryEmotion,
            score: entry.emotionAnalysis.score,
            entryId: entry.id,
          });
        } catch (historyError) {
          console.warn(
            "감정 히스토리 저장 실패, 일기 저장은 성공:",
            historyError
          );
        }
      }

      return entry.id;
    } catch (error) {
      console.error("일기 추가 실패:", error);
      throw error;
    }
  }

  /**
   * 기존 일기 항목을 수정합니다.
   * 감정 분석 결과가 있으면 감정 히스토리도 함께 업데이트합니다.
   *
   * @param entry - 수정할 일기 데이터
   */
  async updateEntry(entry: DiaryEntry): Promise<void> {
    try {
      await this.entries.update(entry.id, entry);

      // 감정 분석 결과가 있으면 히스토리 업데이트 (실패해도 일기 수정은 성공)
      if (entry.emotionAnalysis) {
        try {
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
              date: entry.updatedAt,
              emotion: entry.emotionAnalysis.primaryEmotion,
              score: entry.emotionAnalysis.score,
              entryId: entry.id,
            });
          }
        } catch (historyError) {
          console.warn(
            "감정 히스토리 업데이트 실패, 일기 수정은 성공:",
            historyError
          );
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
      let settings = await this.settings.toCollection().first();
      if (!settings) {
        // 설정이 없으면 기본 설정을 생성하고 반환
        const defaultSettings = {
          theme: "light" as const,
          language: "ko" as const,
          autoSave: true,
          autoSaveInterval: 30000,
          notifications: true,
          backupEnabled: true,
          backupInterval: 7,
        };

        const id = await this.settings.add(defaultSettings);
        settings = await this.settings.get(id);
      }
      return settings!;
    } catch (error) {
      console.error("설정 조회 실패:", error);
      // 에러 발생 시에도 기본 설정 반환
      return {
        id: 1,
        theme: "light",
        language: "ko",
        autoSave: true,
        autoSaveInterval: 30000,
        notifications: true,
        backupEnabled: true,
        backupInterval: 7,
      };
    }
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      // 첫 번째 설정 가져오기
      const existingSettings = await this.settings.toCollection().first();

      if (existingSettings && existingSettings.id) {
        // 기존 설정 업데이트
        await this.settings.update(existingSettings.id, settings);
        console.log("기존 설정이 업데이트되었습니다:", settings);
      } else {
        // 설정이 없으면 새로 생성
        const defaultSettings = {
          theme: "light" as const,
          language: "ko" as const,
          autoSave: true,
          autoSaveInterval: 30000,
          notifications: true,
          backupEnabled: true,
          backupInterval: 7,
          ...settings, // 전달받은 설정으로 오버라이드
        };
        await this.settings.add(defaultSettings);
        console.log("새 설정이 생성되었습니다:", defaultSettings);
      }
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
