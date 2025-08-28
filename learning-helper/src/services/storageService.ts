import { TextDocument, Flashcard, StudySession, StudyProgress } from "@/types";

/**
 * 학습 도구 데이터 저장 및 관리 서비스
 * IndexedDB를 사용하여 문서, 플래시카드, 학습 세션 등의 데이터를 관리합니다.
 */
class StorageService {
  private dbName = "StudyHelperDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  /**
   * IndexedDB 데이터베이스를 초기화합니다.
   * 스키마가 없는 경우 필요한 객체 저장소들을 생성합니다.
   * @returns {Promise<IDBDatabase>} 초기화된 데이터베이스 인스턴스
   */
  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error("IndexedDB를 열 수 없습니다."));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Documents store
        if (!db.objectStoreNames.contains("documents")) {
          const documentStore = db.createObjectStore("documents", {
            keyPath: "id",
          });
          documentStore.createIndex("uploadDate", "uploadDate", {
            unique: false,
          });
          documentStore.createIndex("title", "title", { unique: false });
        }

        // Flashcards store
        if (!db.objectStoreNames.contains("flashcards")) {
          const cardStore = db.createObjectStore("flashcards", {
            keyPath: "id",
          });
          cardStore.createIndex("nextReview", "nextReview", { unique: false });
          cardStore.createIndex("difficulty", "difficulty", { unique: false });
          cardStore.createIndex("tags", "tags", {
            unique: false,
            multiEntry: true,
          });
        }

        // Study sessions store
        if (!db.objectStoreNames.contains("studySessions")) {
          const sessionStore = db.createObjectStore("studySessions", {
            keyPath: "id",
          });
          sessionStore.createIndex("startTime", "startTime", { unique: false });
          sessionStore.createIndex("sessionType", "sessionType", {
            unique: false,
          });
        }

        // Study progress store
        if (!db.objectStoreNames.contains("studyProgress")) {
          db.createObjectStore("studyProgress", { keyPath: "id" });
        }

        console.log("IndexedDB 스키마 업그레이드 완료");
      };
    });
  }

  // Documents
  /**
   * 텍스트 문서를 IndexedDB에 저장합니다.
   * @param {TextDocument} document - 저장할 문서 객체
   * @returns {Promise<void>}
   */
  async saveDocument(document: TextDocument): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");

      const request = store.put(document);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("문서 저장 실패"));
    });
  }

  /**
   * 저장된 모든 문서를 조회합니다.
   * @returns {Promise<TextDocument[]>} 저장된 문서 배열
   */
  async getAllDocuments(): Promise<TextDocument[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");

      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("문서 조회 실패"));
    });
  }

  /**
   * 지정된 ID의 문서를 삭제합니다.
   * @param {string} id - 삭제할 문서 ID
   * @returns {Promise<void>}
   */
  async deleteDocument(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("문서 삭제 실패"));
    });
  }

  // Flashcards
  /**
   * 단일 플래시카드를 저장합니다.
   * @param {Flashcard} card - 저장할 플래시카드 객체
   * @returns {Promise<void>}
   */
  async saveFlashcard(card: Flashcard): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");

      const request = store.put(card);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("플래시카드 저장 실패"));
    });
  }

  /**
   * 다수의 플래시카드를 일괄 저장합니다.
   * @param {Flashcard[]} cards - 저장할 플래시카드 배열
   * @returns {Promise<void>}
   */
  async saveFlashcards(cards: Flashcard[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");

      let completed = 0;
      let hasError = false;

      cards.forEach((card) => {
        const request = store.put(card);

        request.onsuccess = () => {
          completed++;
          if (completed === cards.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(new Error("플래시카드 저장 실패"));
        };
      });
    });
  }

  /**
   * 저장된 모든 플래시카드를 조회합니다.
   * @returns {Promise<Flashcard[]>} 저장된 플래시카드 배열
   */
  async getAllFlashcards(): Promise<Flashcard[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readonly");
      const store = transaction.objectStore("flashcards");

      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("플래시카드 조회 실패"));
    });
  }

  // 문서별 플래시카드 관리 메서드들
  async getFlashcardsByDocument(documentId: string): Promise<Flashcard[]> {
    const allCards = await this.getAllFlashcards();
    return allCards.filter((card) => card.documentId === documentId);
  }

  async deleteFlashcardsByDocument(documentId: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");

      // 문서 ID로 플래시카드 조회
      const request = store.getAll();

      request.onsuccess = () => {
        const cards = request.result || [];
        const cardsToDelete = cards.filter(
          (card) => card.documentId === documentId
        );

        if (cardsToDelete.length === 0) {
          resolve();
          return;
        }

        let deleted = 0;
        let hasError = false;

        cardsToDelete.forEach((card) => {
          const deleteRequest = store.delete(card.id);

          deleteRequest.onsuccess = () => {
            deleted++;
            if (deleted === cardsToDelete.length && !hasError) {
              resolve();
            }
          };

          deleteRequest.onerror = () => {
            hasError = true;
            reject(new Error("플래시카드 삭제 실패"));
          };
        });
      };

      request.onerror = () => reject(new Error("플래시카드 조회 실패"));
    });
  }

  async deleteFlashcard(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("플래시카드 삭제 실패"));
    });
  }

  async getDueFlashcards(): Promise<Flashcard[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readonly");
      const store = transaction.objectStore("flashcards");
      const index = store.index("nextReview");

      const now = new Date();
      const request = index.getAll(IDBKeyRange.upperBound(now));

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("복습 예정 카드 조회 실패"));
    });
  }

  // Study Sessions
  async saveStudySession(session: StudySession): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["studySessions"], "readwrite");
      const store = transaction.objectStore("studySessions");

      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("학습 세션 저장 실패"));
    });
  }

  async getRecentStudySessions(limit: number = 10): Promise<StudySession[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["studySessions"], "readonly");
      const store = transaction.objectStore("studySessions");
      const index = store.index("startTime");

      const request = index.openCursor(null, "prev");
      const sessions: StudySession[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && sessions.length < limit) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };

      request.onerror = () => reject(new Error("학습 세션 조회 실패"));
    });
  }

  // Study Progress
  async saveStudyProgress(progress: StudyProgress): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["studyProgress"], "readwrite");
      const store = transaction.objectStore("studyProgress");

      const progressWithId = { ...progress, id: "main" };
      const request = store.put(progressWithId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("학습 진도 저장 실패"));
    });
  }

  async getStudyProgress(): Promise<StudyProgress | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["studyProgress"], "readonly");
      const store = transaction.objectStore("studyProgress");

      const request = store.get("main");

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...progress } = result; // eslint-disable-line @typescript-eslint/no-unused-vars
          resolve(progress as StudyProgress);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(new Error("학습 진도 조회 실패"));
    });
  }

  // Quiz management
  /**
   * localStorage에 저장된 모든 퀴즈 세션을 조회합니다.
   * @returns {Promise<any[]>} 저장된 퀴즈 세션 배열
   */
  async getQuizSessions(): Promise<any[]> {
    const sessions: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('quiz-session-')) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}');
          sessions.push(session);
        } catch (error) {
          console.warn('퀴즈 세션 파싱 오류:', error);
        }
      }
    }
    return sessions;
  }

  /**
   * localStorage에 저장된 퀴즈 결과를 조회합니다.
   * @returns {Promise<any[]>} 저장된 퀴즈 결과 배열
   */
  async getQuizResults(): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('quiz-results') || '[]');
    } catch (error) {
      console.warn('퀴즈 결과 조회 오류:', error);
      return [];
    }
  }

  /**
   * 모든 퀴즈 세션에서 문제들을 추출하여 반환합니다.
   * @returns {Promise<any[]>} 전체 퀴즈 문제 배열
   */
  async getQuizQuestions(): Promise<any[]> {
    const sessions = await this.getQuizSessions();
    const allQuestions: any[] = [];
    
    sessions.forEach(session => {
      if (session.questions && Array.isArray(session.questions)) {
        allQuestions.push(...session.questions);
      }
    });
    
    return allQuestions;
  }

  /**
   * localStorage에서 퀴즈 관련 데이터를 모두 삭제합니다.
   * @private
   */
  private clearLocalStorageQuizData(): void {
    // localStorage에서 퀴즈 관련 데이터 삭제
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('quiz-session-') || key === 'quiz-results')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('localStorage 퀴즈 데이터 삭제 완료:', keysToRemove.length, '개 항목');
  }

  // Database management
  /**
   * IndexedDB와 localStorage의 모든 데이터를 삭제합니다.
   * 문서, 플래시카드, 학습 세션, 퀴즈 데이터 등을 모두 초기화합니다.
   * @returns {Promise<void>}
   */
  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const storeNames = [
        "documents",
        "flashcards",
        "studySessions",
        "studyProgress",
      ];
      const transaction = db.transaction(storeNames, "readwrite");

      let completed = 0;
      const total = storeNames.length;

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            // localStorage의 퀴즈 데이터도 함께 삭제
            this.clearLocalStorageQuizData();
            resolve();
          }
        };

        request.onerror = () =>
          reject(new Error(`${storeName} 스토어 초기화 실패`));
      });
    });
  }

  async clearFlashcards(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");

      const request = store.clear();

      request.onsuccess = () => {
        console.log("모든 플래시카드 삭제 완료");
        resolve();
      };

      request.onerror = () =>
        reject(new Error("플래시카드 스토어 초기화 실패"));
    });
  }

  async clearStudyData(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const storeNames = ["flashcards", "studySessions", "studyProgress"];
      const transaction = db.transaction(storeNames, "readwrite");

      let completed = 0;
      const total = storeNames.length;

      storeNames.forEach((storeName) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log("플래시카드, 학습 세션, 진도 데이터 모두 삭제 완료");
            resolve();
          }
        };

        request.onerror = () =>
          reject(new Error(`${storeName} 스토어 초기화 실패`));
      });
    });
  }

  async exportData(): Promise<string> {
    const [documents, flashcards, sessions, progress] = await Promise.all([
      this.getAllDocuments(),
      this.getAllFlashcards(),
      this.getRecentStudySessions(100),
      this.getStudyProgress(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      documents,
      flashcards,
      sessions,
      progress,
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.documents) {
        for (const doc of data.documents) {
          await this.saveDocument(doc);
        }
      }

      if (data.flashcards) {
        await this.saveFlashcards(data.flashcards);
      }

      if (data.sessions) {
        for (const session of data.sessions) {
          await this.saveStudySession(session);
        }
      }

      if (data.progress) {
        await this.saveStudyProgress(data.progress);
      }

      console.log("데이터 가져오기 완료");
    } catch (error) {
      throw new Error("잘못된 데이터 형식입니다.");
    }
  }
}

export const storageService = new StorageService();
