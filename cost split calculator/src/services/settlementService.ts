/**
 * 분할 계산 결과를 기반으로 정산 정보를 생성하는 함수
 *
 * 현재는 기본 구조만 구현되어 있으며,
 * 향후 최적화된 송금 계획을 생성하는 알고리즘을 추가할 예정입니다.
 *
 * @param splitResults - 분할 계산 결과 데이터
 * @returns 정산 정보 객체
 * @returns returns.settlements - 송금 계획 목록
 * @returns returns.optimized - 최적화 여부
 */
export function generateSettlement(splitResults: any) {
  return {
    settlements: [],
    optimized: true,
  };
}

export default { generateSettlement };
