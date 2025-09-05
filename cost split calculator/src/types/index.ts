/**
 * 스마트 영수증 분할 계산기의 핵심 타입 정의
 *
 * 애플리케이션 전반에서 사용되는 주요 데이터 구조와 인터페이스를 정의합니다.
 * 계산기, OCR, 히스토리 등 모든 기능에서 공통으로 사용되는 타입들을 포함합니다.
 */

/**
 * 계산할 상품/항목 정보를 나타내는 인터페이스
 *
 * @interface BillItem
 * @property {string} id - 항목의 고유 식별자
 * @property {string} name - 상품명
 * @property {number} price - 단가
 * @property {number} quantity - 수량
 * @property {string} [category] - 상품 카테고리 (선택사항)
 * @property {string[]} [assignedParticipants] - 할당된 참가자 ID 목록
 */
export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  assignedParticipants?: string[];
}

/**
 * 분할 계산에 참여하는 참가자 정보를 나타내는 인터페이스
 *
 * @interface Participant
 * @property {string} id - 참가자의 고유 식별자
 * @property {string} name - 참가자 이름
 * @property {string} [email] - 이메일 주소 (선택사항)
 * @property {number} [share] - 분할 비율 (선택사항)
 * @property {string} [color] - UI에서 사용할 색상 코드 (선택사항)
 */
export interface Participant {
  id: string;
  name: string;
  email?: string;
  share?: number;
  color?: string;
}

/**
 * 분할 계산의 최종 결과를 나타내는 인터페이스
 *
 * @interface CalculationResult
 * @property {string} id - 계산 결과의 고유 식별자
 * @property {BillItem[]} items - 계산된 항목 목록
 * @property {Participant[]} participants - 참가자 목록
 * @property {any} splitResults - 분할 계산 결과 데이터
 * @property {any} settlement - 정산 정보
 * @property {Date} createdAt - 생성 일시
 * @property {Date} updatedAt - 수정 일시
 */
export interface CalculationResult {
  id: string;
  items: BillItem[];
  participants: Participant[];
  splitResults: any;
  settlement: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 분할 계산 방식의 타입 정의
 *
 * @typedef {'equal' | 'custom' | 'percentage'} SplitMethod
 * - 'equal': 균등 분할
 * - 'custom': 사용자 정의 분할
 * - 'percentage': 비율 분할
 */
export type SplitMethod = "equal" | "custom" | "percentage";

/**
 * OCR 처리 결과를 나타내는 인터페이스
 *
 * @interface OCRResult
 * @property {BillItem[]} items - 추출된 항목 목록
 * @property {number} confidence - OCR 신뢰도 (0-1)
 * @property {string} [rawText] - 원본 추출 텍스트 (선택사항)
 */
export interface OCRResult {
  items: BillItem[];
  confidence: number;
  rawText?: string;
}

/**
 * 이미지 파일을 확장한 인터페이스
 *
 * @interface ImageFile
 * @extends File
 * @property {string} id - 파일의 고유 식별자
 * @property {string} [preview] - 미리보기 URL (선택사항)
 */
export interface ImageFile extends File {
  id: string;
  preview?: string;
}

/**
 * useCalculator 훅의 반환 타입을 나타내는 인터페이스
 *
 * @interface UseCalculatorReturn
 * @property {BillItem[]} items - 현재 항목 목록
 * @property {Participant[]} participants - 현재 참가자 목록
 * @property {CalculationResult | null} results - 계산 결과
 * @property {Function} addItem - 항목 추가 함수
 * @property {Function} updateItem - 항목 수정 함수
 * @property {Function} removeItem - 항목 삭제 함수
 * @property {Function} setItems - 항목 목록 설정 함수
 * @property {Function} addParticipant - 참가자 추가 함수
 * @property {Function} updateParticipant - 참가자 수정 함수
 * @property {Function} removeParticipant - 참가자 삭제 함수
 * @property {Function} setParticipants - 참가자 목록 설정 함수
 * @property {Function} calculateResults - 계산 실행 함수
 * @property {Function} reset - 초기화 함수
 */
export interface UseCalculatorReturn {
  items: BillItem[];
  participants: Participant[];
  results: CalculationResult | null;
  addItem: (item: Omit<BillItem, "id">) => void;
  updateItem: (id: string, updates: Partial<BillItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: BillItem[]) => void;
  addParticipant: (participant: Omit<Participant, "id">) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  setParticipants: (participants: Participant[]) => void;
  calculateResults: () => void;
  reset: () => void;
}
