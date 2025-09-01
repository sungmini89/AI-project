// PWA 오프라인 스토리지 관리
export interface OfflinePalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: number;
  keyword?: string;
  harmonyType?: string;
  source: 'online' | 'offline' | 'cache';
}

export interface OfflineColorHistory {
  id: string;
  color: string;
  name: string;
  timestamp: number;
  source: string;
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private dbName = 'ColorPaletteDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // 한국어 키워드 → 색상 오프라인 매핑
  private koreanColorMapping: Record<string, string[]> = {
    '바다': ['#0077BE', '#006994', '#4A90B8', '#87CEEB', '#20B2AA'],
    '하늘': ['#87CEEB', '#B6D8F2', '#4A90E2', '#E6F3FF', '#ADD8E6'],
    '숲': ['#228B22', '#2F4F2F', '#6B8E23', '#90EE90', '#32CD32'],
    '꽃': ['#FFB6C1', '#FF69B4', '#FFC0CB', '#DA70D6', '#FF1493'],
    '따뜻함': ['#FF6B35', '#F7931E', '#FFD700', '#FFA500', '#FF4500'],
    '차가움': ['#4169E1', '#00CED1', '#87CEEB', '#B0E0E6', '#1E90FF'],
    '자연': ['#8FBC8F', '#9ACD32', '#6B8E23', '#228B22', '#7CFC00'],
    '도시': ['#708090', '#2F4F4F', '#696969', '#A9A9A9', '#C0C0C0'],
    '밤': ['#191970', '#000080', '#483D8B', '#2F2F4F', '#1A1A2E'],
    '낮': ['#FFD700', '#FFA500', '#FF6347', '#FF4500', '#FFFF99'],
    '봄': ['#98FB98', '#FFE4B5', '#F0E68C', '#DDA0DD', '#FFC0CB'],
    '여름': ['#00CED1', '#32CD32', '#FFD700', '#FF6B35', '#87CEEB'],
    '가을': ['#D2691E', '#B22222', '#DAA520', '#CD853F', '#A0522D'],
    '겨울': ['#B0C4DE', '#F5F5F5', '#708090', '#4682B4', '#E6E6FA'],
    '사랑': ['#FF1493', '#FF69B4', '#DC143C', '#B22222', '#FFB6C1'],
    '평화': ['#98FB98', '#E0FFFF', '#F0F8FF', '#E6E6FA', '#F5FFFA'],
    '에너지': ['#FF4500', '#FF6347', '#FFD700', '#32CD32', '#00BFFF'],
    '우아함': ['#DDA0DD', '#E6E6FA', '#F8F8FF', '#FFF8DC', '#FFFACD']
  };

  private constructor() {}

  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  // IndexedDB 초기화
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB 열기 실패:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 초기화 완료');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 팔레트 저장소
        if (!db.objectStoreNames.contains('palettes')) {
          const paletteStore = db.createObjectStore('palettes', { keyPath: 'id' });
          paletteStore.createIndex('keyword', 'keyword', { unique: false });
          paletteStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 색상 히스토리 저장소
        if (!db.objectStoreNames.contains('colorHistory')) {
          const historyStore = db.createObjectStore('colorHistory', { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 설정 저장소
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        console.log('IndexedDB 스키마 업그레이드 완료');
      };
    });
  }

  // 오프라인 팔레트 생성
  async generateOfflinePalette(keyword: string, harmonyType: string = 'analogous'): Promise<OfflinePalette> {
    const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 키워드 기반 기본 색상 선택
    let baseColors = this.koreanColorMapping[keyword.toLowerCase()];
    
    // 키워드 매치 실패 시 기본 색상
    if (!baseColors) {
      baseColors = this.generateRandomColors(5);
    }

    // 조화 알고리즘 적용
    const harmonizedColors = this.applyHarmonyAlgorithm(baseColors, harmonyType);

    const palette: OfflinePalette = {
      id,
      name: `${keyword} (오프라인)`,
      colors: harmonizedColors.slice(0, 5), // 5개 색상으로 제한
      createdAt: Date.now(),
      keyword,
      harmonyType,
      source: 'offline'
    };

    // 로컬 저장
    await this.savePalette(palette);
    
    return palette;
  }

  // 랜덤 색상 생성
  private generateRandomColors(count: number): string[] {
    const colors: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const hue = Math.random() * 360;
      const saturation = 60 + Math.random() * 30; // 60-90%
      const lightness = 30 + Math.random() * 40; // 30-70%
      
      const hex = this.hslToHex(hue, saturation, lightness);
      colors.push(hex);
    }
    
    return colors;
  }

  // 색상 조화 알고리즘 적용
  private applyHarmonyAlgorithm(baseColors: string[], harmonyType: string): string[] {
    const harmonized: string[] = [];
    
    baseColors.forEach((color, index) => {
      const [h, s, l] = this.hexToHsl(color);
      
      switch (harmonyType) {
        case 'complementary':
          if (index === 0) {
            harmonized.push(color);
            harmonized.push(this.hslToHex((h + 180) % 360, s, l));
          }
          break;
          
        case 'analogous':
          harmonized.push(color);
          if (harmonized.length < 5) {
            harmonized.push(this.hslToHex((h + 30) % 360, s, l));
            if (harmonized.length < 5) {
              harmonized.push(this.hslToHex((h - 30 + 360) % 360, s, l));
            }
          }
          break;
          
        case 'triadic':
          if (index === 0) {
            harmonized.push(color);
            harmonized.push(this.hslToHex((h + 120) % 360, s, l));
            harmonized.push(this.hslToHex((h + 240) % 360, s, l));
          }
          break;
          
        default:
          harmonized.push(color);
      }
    });
    
    return harmonized;
  }

  // 팔레트 저장
  async savePalette(palette: OfflinePalette): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['palettes'], 'readwrite');
      const store = transaction.objectStore('palettes');
      const request = store.put(palette);

      request.onsuccess = () => {
        console.log('오프라인 팔레트 저장 완료:', palette.id);
        resolve();
      };

      request.onerror = () => {
        console.error('팔레트 저장 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 저장된 팔레트 조회
  async getSavedPalettes(): Promise<OfflinePalette[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['palettes'], 'readonly');
      const store = transaction.objectStore('palettes');
      const request = store.getAll();

      request.onsuccess = () => {
        const palettes = request.result.sort((a, b) => b.createdAt - a.createdAt);
        resolve(palettes);
      };

      request.onerror = () => {
        console.error('팔레트 조회 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 색상 히스토리 저장
  async saveColorHistory(color: string, name: string, source: string): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    const historyItem: OfflineColorHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      color,
      name,
      timestamp: Date.now(),
      source
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['colorHistory'], 'readwrite');
      const store = transaction.objectStore('colorHistory');
      const request = store.put(historyItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 색상 히스토리 조회
  async getColorHistory(limit: number = 50): Promise<OfflineColorHistory[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['colorHistory'], 'readonly');
      const store = transaction.objectStore('colorHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // 최신순 정렬
      
      const results: OfflineColorHistory[] = [];
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 설정 저장
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 설정 조회
  async getSetting(key: string): Promise<any> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 데이터 정리
  async clearOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    if (!this.db) {
      await this.initialize();
    }

    // 팔레트 정리
    await this.clearOldPalettes(cutoffDate);
    
    // 히스토리 정리
    await this.clearOldHistory(cutoffDate);
  }

  private async clearOldPalettes(cutoffDate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['palettes'], 'readwrite');
      const store = transaction.objectStore('palettes');
      const index = store.index('createdAt');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async clearOldHistory(cutoffDate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['colorHistory'], 'readwrite');
      const store = transaction.objectStore('colorHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate));

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // HSL to HEX 변환
  private hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // HEX to HSL 변환
  private hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }
}

// 전역 오프라인 스토리지 관리자
export const offlineStorage = OfflineStorageManager.getInstance();