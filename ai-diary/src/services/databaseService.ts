import Dexie, { Table } from 'dexie';
import { EmotionAnalysisResult, EmotionType } from './emotionAnalysisService';

// 일기 엔트리 인터페이스
export interface DiaryEntry {
  id?: number;
  title: string;
  content: string;
  htmlContent: string; // Tiptap에서 생성된 HTML
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  mood: EmotionType;
  weather?: string;
  location?: string;
  emotionAnalysis?: EmotionAnalysisResult;
  wordCount: number;
  isPrivate: boolean;
  attachments?: string[]; // 첨부 파일 경로들
}

// 감정 히스토리 인터페이스
export interface EmotionHistory {
  id?: number;
  date: Date;
  emotions: Record<EmotionType, number>;
  primaryEmotion: EmotionType;
  overallScore: number;
  confidence: number;
  diaryEntryId?: number;
}

// 백업 데이터 인터페이스
export interface BackupData {
  id?: number;
  timestamp: Date;
  version: string;
  entries: DiaryEntry[];
  emotions: EmotionHistory[];
  metadata: {
    totalEntries: number;
    dateRange: { start: Date; end: Date };
    emotionSummary: Record<EmotionType, number>;
  };
}

// 설정 인터페이스
export interface AppSettings {
  id?: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  autoSave: boolean;
  autoSaveInterval: number; // 밀리초
  backupEnabled: boolean;
  analysisMode: 'offline' | 'free' | 'premium';
  reminderEnabled: boolean;
  reminderTime: string; // HH:MM 형식
  privacyMode: boolean;
  exportFormat: 'json' | 'markdown' | 'html';
  lastBackup?: Date;
}

// 통계 인터페이스
export interface Statistics {
  id?: number;
  totalEntries: number;
  totalWords: number;
  averageWordsPerEntry: number;
  writingStreak: number;
  longestStreak: number;
  emotionDistribution: Record<EmotionType, number>;
  mostActiveHour: number;
  mostActiveDayOfWeek: number;
  lastUpdated: Date;
}

// 데이터베이스 클래스
class DiaryDatabase extends Dexie {
  entries!: Table<DiaryEntry>;
  emotions!: Table<EmotionHistory>;
  backups!: Table<BackupData>;
  settings!: Table<AppSettings>;
  statistics!: Table<Statistics>;

  constructor() {
    super('AIDiaryDB');
    
    // 스키마 버전 1
    this.version(1).stores({
      entries: '++id, date, createdAt, updatedAt, tags, mood, isPrivate',
      emotions: '++id, date, primaryEmotion, diaryEntryId',
      backups: '++id, timestamp',
      settings: '++id',
      statistics: '++id, lastUpdated'
    });

    // 인덱스 추가를 위한 버전 2
    this.version(2).stores({
      entries: '++id, date, createdAt, updatedAt, tags, mood, isPrivate, wordCount',
      emotions: '++id, date, primaryEmotion, diaryEntryId, overallScore',
      backups: '++id, timestamp, version',
      settings: '++id, theme, language',
      statistics: '++id, lastUpdated, totalEntries'
    });

    this.on('ready', () => {
      this.initializeDefaultSettings();
    });
  }

  // 기본 설정 초기화
  private async initializeDefaultSettings() {
    const settingsCount = await this.settings.count();
    if (settingsCount === 0) {
      await this.settings.add({
        theme: 'auto',
        language: 'ko',
        autoSave: true,
        autoSaveInterval: 30000,
        backupEnabled: true,
        analysisMode: 'offline',
        reminderEnabled: false,
        reminderTime: '20:00',
        privacyMode: false,
        exportFormat: 'json',
      });
    }

    const statsCount = await this.statistics.count();
    if (statsCount === 0) {
      await this.statistics.add({
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        writingStreak: 0,
        longestStreak: 0,
        emotionDistribution: {
          happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
          calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
        },
        mostActiveHour: 20,
        mostActiveDayOfWeek: 0,
        lastUpdated: new Date(),
      });
    }
  }
}

// 데이터베이스 서비스 클래스
class DatabaseService {
  private db: DiaryDatabase;

  constructor() {
    this.db = new DiaryDatabase();
  }

  // === 일기 엔트리 관련 메서드 ===

  // 새 일기 추가
  async addEntry(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    const newEntry: DiaryEntry = {
      ...entry,
      createdAt: now,
      updatedAt: now,
    };

    const id = await this.db.entries.add(newEntry);
    
    // 감정 히스토리 추가
    if (entry.emotionAnalysis) {
      await this.addEmotionHistory({
        date: entry.date,
        emotions: entry.emotionAnalysis.emotionScores,
        primaryEmotion: entry.emotionAnalysis.primaryEmotion,
        overallScore: entry.emotionAnalysis.score,
        confidence: entry.emotionAnalysis.confidence,
        diaryEntryId: id,
      });
    }

    // 통계 업데이트
    await this.updateStatistics();

    return id;
  }

  // 일기 수정
  async updateEntry(id: number, updates: Partial<DiaryEntry>): Promise<void> {
    await this.db.entries.update(id, {
      ...updates,
      updatedAt: new Date(),
    });

    // 감정 분석이 업데이트된 경우 감정 히스토리도 업데이트
    if (updates.emotionAnalysis) {
      const entry = await this.getEntry(id);
      if (entry) {
        await this.updateEmotionHistory(entry.date, {
          emotions: updates.emotionAnalysis.emotionScores,
          primaryEmotion: updates.emotionAnalysis.primaryEmotion,
          overallScore: updates.emotionAnalysis.score,
          confidence: updates.emotionAnalysis.confidence,
        });
      }
    }

    await this.updateStatistics();
  }

  // 일기 삭제
  async deleteEntry(id: number): Promise<void> {
    await this.db.entries.delete(id);
    // 관련 감정 히스토리도 삭제
    await this.db.emotions.where('diaryEntryId').equals(id).delete();
    await this.updateStatistics();
  }

  // 단일 일기 조회
  async getEntry(id: number): Promise<DiaryEntry | undefined> {
    return await this.db.entries.get(id);
  }

  // 모든 일기 조회 (페이지네이션)
  async getEntries(
    limit: number = 20,
    offset: number = 0,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      mood?: EmotionType;
      tags?: string[];
      isPrivate?: boolean;
    }
  ): Promise<DiaryEntry[]> {
    let query = this.db.entries.orderBy('date').reverse();

    if (filters) {
      if (filters.startDate) {
        query = query.filter(entry => entry.date >= filters.startDate!);
      }
      if (filters.endDate) {
        query = query.filter(entry => entry.date <= filters.endDate!);
      }
      if (filters.mood) {
        query = query.filter(entry => entry.mood === filters.mood);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.filter(entry =>
          filters.tags!.some(tag => entry.tags.includes(tag))
        );
      }
      if (filters.isPrivate !== undefined) {
        query = query.filter(entry => entry.isPrivate === filters.isPrivate);
      }
    }

    return await query.offset(offset).limit(limit).toArray();
  }

  // 일기 검색
  async searchEntries(
    searchTerm: string,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<DiaryEntry[]> {
    let query = this.db.entries
      .filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    if (filters?.startDate) {
      query = query.filter(entry => entry.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      query = query.filter(entry => entry.date <= filters.endDate!);
    }

    return await query.toArray();
  }

  // 특정 날짜의 일기 조회
  async getEntriesByDate(date: Date): Promise<DiaryEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.db.entries
      .where('date')
      .between(startOfDay, endOfDay)
      .toArray();
  }

  // === 감정 히스토리 관련 메서드 ===

  // 감정 히스토리 추가
  async addEmotionHistory(emotion: Omit<EmotionHistory, 'id'>): Promise<number> {
    return await this.db.emotions.add(emotion);
  }

  // 감정 히스토리 업데이트
  async updateEmotionHistory(
    date: Date,
    updates: Partial<EmotionHistory>
  ): Promise<void> {
    const existing = await this.db.emotions
      .where('date')
      .equals(date)
      .first();

    if (existing) {
      await this.db.emotions.update(existing.id!, updates);
    }
  }

  // 기간별 감정 히스토리 조회
  async getEmotionHistory(startDate: Date, endDate: Date): Promise<EmotionHistory[]> {
    return await this.db.emotions
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  // 월별 감정 트렌드 조회
  async getMonthlyEmotionTrend(year: number, month: number): Promise<EmotionHistory[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    return await this.getEmotionHistory(startDate, endDate);
  }

  // === 설정 관련 메서드 ===

  // 설정 조회
  async getSettings(): Promise<AppSettings> {
    const settings = await this.db.settings.toCollection().first();
    if (!settings) {
      throw new Error('Settings not found');
    }
    return settings;
  }

  // 설정 업데이트
  async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const settings = await this.getSettings();
    await this.db.settings.update(settings.id!, updates);
  }

  // === 통계 관련 메서드 ===

  // 통계 조회
  async getStatistics(): Promise<Statistics> {
    const stats = await this.db.statistics.toCollection().first();
    if (!stats) {
      throw new Error('Statistics not found');
    }
    return stats;
  }

  // 통계 업데이트
  async updateStatistics(): Promise<void> {
    const entries = await this.db.entries.toArray();
    const emotions = await this.db.emotions.toArray();

    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // 감정 분포 계산
    const emotionDistribution: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    emotions.forEach(emotion => {
      emotionDistribution[emotion.primaryEmotion]++;
    });

    // 연속 작성일 계산
    const writingStreak = this.calculateWritingStreak(entries);
    const longestStreak = this.calculateLongestStreak(entries);

    // 가장 활발한 시간대 계산
    const hourCounts = new Array(24).fill(0);
    entries.forEach(entry => {
      hourCounts[entry.createdAt.getHours()]++;
    });
    const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

    // 가장 활발한 요일 계산
    const dayCounts = new Array(7).fill(0);
    entries.forEach(entry => {
      dayCounts[entry.createdAt.getDay()]++;
    });
    const mostActiveDayOfWeek = dayCounts.indexOf(Math.max(...dayCounts));

    const stats = await this.getStatistics();
    await this.db.statistics.update(stats.id!, {
      totalEntries,
      totalWords,
      averageWordsPerEntry,
      writingStreak,
      longestStreak,
      emotionDistribution,
      mostActiveHour,
      mostActiveDayOfWeek,
      lastUpdated: new Date(),
    });
  }

  // 연속 작성일 계산
  private calculateWritingStreak(entries: DiaryEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() === currentDate.getTime() + 86400000) {
        // 하루 건너뛴 경우
        break;
      }
    }

    return streak;
  }

  // 최장 연속 작성일 계산
  private calculateLongestStreak(entries: DiaryEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => a.date.getTime() - b.date.getTime());
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date);
      const currentDate = new Date(sortedEntries[i].date);
      
      prevDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / 86400000;

      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  // === 백업 관련 메서드 ===

  // 백업 생성
  async createBackup(): Promise<number> {
    const entries = await this.db.entries.toArray();
    const emotions = await this.db.emotions.toArray();
    
    const dateRange = entries.length > 0 ? {
      start: new Date(Math.min(...entries.map(e => e.date.getTime()))),
      end: new Date(Math.max(...entries.map(e => e.date.getTime())))
    } : { start: new Date(), end: new Date() };

    const emotionSummary: Record<EmotionType, number> = {
      happy: 0, sad: 0, angry: 0, neutral: 0, excited: 0,
      calm: 0, anxious: 0, proud: 0, disappointed: 0, grateful: 0
    };

    emotions.forEach(emotion => {
      emotionSummary[emotion.primaryEmotion]++;
    });

    const backup: BackupData = {
      timestamp: new Date(),
      version: '1.0.0',
      entries,
      emotions,
      metadata: {
        totalEntries: entries.length,
        dateRange,
        emotionSummary,
      }
    };

    const backupId = await this.db.backups.add(backup);
    
    // 설정에서 백업 시간 업데이트
    await this.updateSettings({ lastBackup: new Date() });
    
    return backupId;
  }

  // 백업 복원
  async restoreBackup(backupId: number): Promise<void> {
    const backup = await this.db.backups.get(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    // 기존 데이터 삭제
    await this.db.entries.clear();
    await this.db.emotions.clear();

    // 백업 데이터 복원
    await this.db.entries.bulkAdd(backup.entries.map(entry => ({
      ...entry,
      id: undefined, // ID 자동 생성
    })));

    await this.db.emotions.bulkAdd(backup.emotions.map(emotion => ({
      ...emotion,
      id: undefined,
    })));

    await this.updateStatistics();
  }

  // 백업 목록 조회
  async getBackups(): Promise<BackupData[]> {
    return await this.db.backups.orderBy('timestamp').reverse().toArray();
  }

  // 백업 삭제
  async deleteBackup(backupId: number): Promise<void> {
    await this.db.backups.delete(backupId);
  }

  // === 유틸리티 메서드 ===

  // 데이터베이스 초기화 (개발용)
  async clearAllData(): Promise<void> {
    await this.db.entries.clear();
    await this.db.emotions.clear();
    await this.db.backups.clear();
    await this.updateStatistics();
  }

  // 데이터베이스 연결 상태 확인
  async isConnected(): Promise<boolean> {
    try {
      await this.db.entries.count();
      return true;
    } catch (error) {
      return false;
    }
  }

  // 데이터베이스 크기 조회 (추정치)
  async getDatabaseSize(): Promise<number> {
    const entries = await this.db.entries.count();
    const emotions = await this.db.emotions.count();
    const backups = await this.db.backups.count();
    
    // 대략적인 크기 계산 (바이트)
    return (entries * 1000) + (emotions * 200) + (backups * 10000);
  }
}

// 기본 데이터베이스 서비스 인스턴스
export const databaseService = new DatabaseService();
export default DatabaseService;