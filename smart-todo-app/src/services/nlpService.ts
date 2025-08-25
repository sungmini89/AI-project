import * as chrono from "chrono-node";
import nlp from "compromise";
import type { TaskCategory, TaskPriority, TaskInsights } from "../types";
import {
  CATEGORY_KEYWORDS,
  PRIORITY_KEYWORDS,
  TIME_KEYWORDS,
} from "@/constants";
import { parseTimeFromString } from "@/utils";

interface ParsedTask {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedTime?: number;
  tags: string[];
  confidence: number;
}

class NLPService {
  parseTaskInput(input: string): ParsedTask {
    const cleanInput = input.trim();

    const dateResult = this.extractDate(cleanInput);

    const timeResult = this.extractTime(cleanInput);

    const categoryResult = this.categorizeTask(cleanInput);

    const priorityResult = this.extractPriority(cleanInput);

    const tags = this.extractTags(cleanInput);

    const title = this.cleanTitle(cleanInput, dateResult.originalText);

    let confidence = 0.7;
    if (dateResult.confidence > 0) confidence += 0.1;
    if (categoryResult.confidence > 0.5) confidence += 0.1;
    if (priorityResult.confidence > 0.5) confidence += 0.1;

    return {
      title,
      category: categoryResult.category,
      priority: priorityResult.priority,
      dueDate: dateResult.date,
      estimatedTime: timeResult,
      tags,
      confidence: Math.min(confidence, 1.0),
    };
  }

  private extractDate(text: string): {
    date?: Date;
    confidence: number;
    originalText: string;
  } {
    try {
      const results = chrono.parse(text, new Date(), { forwardDate: true });

      if (results.length > 0) {
        const result = results[0];
        return {
          date: result.date(),
          confidence: 0.8,
          originalText: result.text,
        };
      }

      const koreanDatePatterns = [
        { pattern: /오늘/g, offset: 0 },
        { pattern: /내일/g, offset: 1 },
        { pattern: /모레/g, offset: 2 },
        { pattern: /(\d+)일\s*후/g, offset: "dynamic" },
      ];

      // 월/일 형식 패턴 추가 (예: 8월30일, 12월 25일)
      const monthDayPattern = /(\d{1,2})월\s*(\d{1,2})일?/g;
      const monthDayMatches = [...text.matchAll(monthDayPattern)];
      if (monthDayMatches.length > 0) {
        const match = monthDayMatches[0];
        const month = parseInt(match[1]) - 1; // JavaScript Date는 0부터 시작
        const day = parseInt(match[2]);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const targetDate = new Date(currentYear, month, day);

        // 만약 지정된 날짜가 오늘보다 이전이면 내년으로 설정
        if (targetDate < currentDate) {
          targetDate.setFullYear(currentYear + 1);
        }

        return {
          date: targetDate,
          confidence: 0.9,
          originalText: match[0],
        };
      }

      // 추가 한국어 날짜 패턴들
      const additionalKoreanPatterns = [
        // 다음주 월요일, 이번주 금요일
        {
          pattern: /다음\s*주\s*(월|화|수|목|금|토|일)요일?/g,
          type: "nextWeekDay",
        },
        {
          pattern: /이번\s*주\s*(월|화|수|목|금|토|일)요일?/g,
          type: "thisWeekDay",
        },
        // 다음달, 이번달
        { pattern: /다음\s*달\s*(\d{1,2})일?/g, type: "nextMonth" },
        { pattern: /이번\s*달\s*(\d{1,2})일?/g, type: "thisMonth" },
        // 주말, 평일
        { pattern: /이번\s*주말/g, type: "thisWeekend" },
        { pattern: /다음\s*주말/g, type: "nextWeekend" },
      ];

      for (const { pattern, type } of additionalKoreanPatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          const date = new Date();

          switch (type) {
            case "nextWeekDay":
            case "thisWeekDay": {
              const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
              const targetDayIndex = dayNames.indexOf(match[1]);
              const currentDayIndex = date.getDay();

              let daysToAdd = targetDayIndex - currentDayIndex;
              if (type === "nextWeekDay") {
                daysToAdd += 7;
              } else if (daysToAdd <= 0) {
                daysToAdd += 7; // 이번 주에서 이미 지난 요일이면 다음 주
              }

              date.setDate(date.getDate() + daysToAdd);
              break;
            }
            case "nextMonth": {
              const day = parseInt(match[1]);
              date.setMonth(date.getMonth() + 1, day);
              break;
            }
            case "thisMonth": {
              const day = parseInt(match[1]);
              date.setDate(day);
              if (date < new Date()) {
                date.setMonth(date.getMonth() + 1);
              }
              break;
            }
            case "thisWeekend": {
              const daysToSaturday = 6 - date.getDay();
              date.setDate(date.getDate() + daysToSaturday);
              break;
            }
            case "nextWeekend": {
              const daysToNextSaturday = 6 - date.getDay() + 7;
              date.setDate(date.getDate() + daysToNextSaturday);
              break;
            }
          }

          return {
            date,
            confidence: 0.85,
            originalText: match[0],
          };
        }
      }

      for (const { pattern, offset } of koreanDatePatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
          const date = new Date();
          if (offset === "dynamic" && matches[0][1]) {
            date.setDate(date.getDate() + parseInt(matches[0][1]));
          } else if (typeof offset === "number") {
            date.setDate(date.getDate() + offset);
          }

          return {
            date,
            confidence: 0.9,
            originalText: matches[0][0],
          };
        }
      }

      const timePatterns = [
        /(\d{1,2}):(\d{2})/g,
        /(\d{1,2})시\s*(\d{1,2})?분?/g,
        /(오전|오후)\s*(\d{1,2})시?/g,
      ];

      for (const pattern of timePatterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
          const match = matches[0];
          const date = new Date();

          if (pattern.source.includes(":")) {
            const hour = parseInt(match[1]);
            const minute = parseInt(match[2]);
            date.setHours(hour, minute, 0, 0);
          } else if (pattern.source.includes("오전|오후")) {
            const isPM = match[1] === "오후";
            const hour = parseInt(match[2]) + (isPM ? 12 : 0);
            date.setHours(hour, 0, 0, 0);
          } else {
            const hour = parseInt(match[1]);
            const minute = match[2] ? parseInt(match[2]) : 0;
            date.setHours(hour, minute, 0, 0);
          }

          if (date < new Date()) {
            date.setDate(date.getDate() + 1);
          }

          return {
            date,
            confidence: 0.7,
            originalText: match[0],
          };
        }
      }
    } catch (error) {
      console.warn("날짜 파싱 중 오류:", error);
    }

    return { confidence: 0, originalText: "" };
  }

  private extractTime(text: string): number | undefined {
    return parseTimeFromString(text);
  }

  private categorizeTask(text: string): {
    category: TaskCategory;
    confidence: number;
  } {
    const lowerText = text.toLowerCase();

    let bestMatch: TaskCategory = "기타";
    let highestScore = 0;
    let confidence = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = category as TaskCategory;
        confidence = Math.min(score * 0.3, 1.0);
      }
    }

    if (confidence === 0) {
      const doc = nlp(text);
      const verbs = doc.verbs().out("array");
      const nouns = doc.nouns().out("array");

      if (
        verbs.includes("운동") ||
        verbs.includes("달리") ||
        nouns.includes("헬스")
      ) {
        return { category: "운동", confidence: 0.6 };
      }

      if (
        verbs.includes("공부") ||
        verbs.includes("학습") ||
        nouns.includes("책")
      ) {
        return { category: "학습", confidence: 0.6 };
      }

      if (
        verbs.includes("만나") ||
        verbs.includes("약속") ||
        nouns.includes("친구")
      ) {
        return { category: "약속", confidence: 0.6 };
      }
    }

    return { category: bestMatch, confidence };
  }

  private extractPriority(text: string): {
    priority: TaskPriority;
    confidence: number;
  } {
    const lowerText = text.toLowerCase();

    for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          return {
            priority: priority as TaskPriority,
            confidence: 0.8,
          };
        }
      }
    }

    const doc = nlp(text);
    const adjectives = doc.adjectives().out("array");

    if (
      adjectives.some((adj: string) => ["중요한", "급한", "빠른"].includes(adj))
    ) {
      return { priority: "high", confidence: 0.6 };
    }

    if (text.includes("!") || text.includes("!!")) {
      const exclamationCount = (text.match(/!/g) || []).length;
      if (exclamationCount >= 2) {
        return { priority: "urgent", confidence: 0.7 };
      }
      return { priority: "high", confidence: 0.6 };
    }

    return { priority: "medium", confidence: 0.3 };
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];

    const hashtagPattern = /#([^\s#]+)/g;
    const hashtagMatches = [...text.matchAll(hashtagPattern)];
    tags.push(...hashtagMatches.map((match) => match[1]));

    const mentionPattern = /@([^\s@]+)/g;
    const mentionMatches = [...text.matchAll(mentionPattern)];
    tags.push(...mentionMatches.map((match) => match[1]));

    const doc = nlp(text);
    const places = doc.places().out("array");
    const people = doc.people().out("array");

    tags.push(...places, ...people);

    for (const [timeType, keywords] of Object.entries(TIME_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          tags.push(timeType);
          break;
        }
      }
    }

    return [...new Set(tags)].filter((tag) => tag.length > 0);
  }

  private cleanTitle(originalText: string, dateText: string): string {
    let title = originalText;

    if (dateText) {
      title = title.replace(dateText, "").trim();
    }

    // 추가 한국어 날짜 패턴들도 제거
    const datePatterns = [
      /\d{1,2}월\s*\d{1,2}일?/g,
      /다음\s*주\s*(월|화|수|목|금|토|일)요일?/g,
      /이번\s*주\s*(월|화|수|목|금|토|일)요일?/g,
      /다음\s*달\s*\d{1,2}일?/g,
      /이번\s*달\s*\d{1,2}일?/g,
      /이번\s*주말/g,
      /다음\s*주말/g,
      /\d+일\s*후/g,
      /오늘|내일|모레/g,
    ];

    for (const pattern of datePatterns) {
      title = title.replace(pattern, "").trim();
    }

    title = title.replace(/#[^\s#]+/g, "").trim();
    title = title.replace(/@[^\s@]+/g, "").trim();

    const priorityWords = Object.values(PRIORITY_KEYWORDS).flat();
    for (const word of priorityWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      title = title.replace(regex, "").trim();
    }

    title = title.replace(/\s+/g, " ").trim();

    if (!title) {
      title =
        originalText.substring(0, 30) + (originalText.length > 30 ? "..." : "");
    }

    return title;
  }

  async enhanceWithAI(text: string): Promise<TaskInsights> {
    const { aiService } = await import("./freeAIService");
    return await aiService.analyzeTask(text);
  }

  combineResults(nlpResult: ParsedTask, aiResult: TaskInsights): ParsedTask {
    const combinedConfidence = (nlpResult.confidence + aiResult.confidence) / 2;

    return {
      ...nlpResult,
      category:
        aiResult.confidence > nlpResult.confidence
          ? aiResult.category
          : nlpResult.category,
      priority:
        aiResult.confidence > nlpResult.confidence
          ? aiResult.priority
          : nlpResult.priority,
      estimatedTime: nlpResult.estimatedTime || aiResult.estimatedTime,
      confidence: combinedConfidence,
    };
  }

  async processInput(input: string): Promise<ParsedTask> {
    const nlpResult = this.parseTaskInput(input);

    try {
      const aiResult = await this.enhanceWithAI(input);
      return this.combineResults(nlpResult, aiResult);
    } catch (error) {
      console.warn("AI 분석 실패, NLP 결과만 사용:", error);
      return nlpResult;
    }
  }

  // 테스트를 위한 디버그 메서드
  testDateParsing(input: string): any {
    if (process.env.NODE_ENV === "development") {
      const result = this.extractDate(input);
      console.log(`날짜 파싱 테스트 - 입력: "${input}"`, result);
      return result;
    }
  }
}

export const nlpService = new NLPService();
