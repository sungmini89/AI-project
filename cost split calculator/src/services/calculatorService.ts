import { BillItem, Participant } from "@/types";

/**
 * 항목과 참가자 정보를 기반으로 분할 계산을 수행하는 함수
 *
 * 현재는 기본적인 총액 계산만 구현되어 있으며,
 * 향후 다양한 분할 방식(균등분할, 비율분할, 항목별 분할 등)을
 * 지원하도록 확장할 수 있습니다.
 *
 * @param items - 계산할 상품/항목 목록
 * @param participants - 참가자 목록
 * @returns 분할 계산 결과 객체
 * @returns returns.items - 원본 항목 목록
 * @returns returns.participants - 원본 참가자 목록
 * @returns returns.total - 전체 총액
 */
export function calculateSplit(items: BillItem[], participants: Participant[]) {
  return {
    items,
    participants,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export default { calculateSplit };
