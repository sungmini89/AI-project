import Tesseract from 'tesseract.js';

export interface OCRResult {
  totalAmount: number;
  items: Array<{
    name: string;
    price: number;
  }>;
}

export class OCRService {
  /**
   * 이미지에서 영수증 정보를 추출합니다
   */
  async processImage(imageFile: File): Promise<OCRResult> {
    console.log('🔍 OCR 처리 시작...');
    
    try {
      // 이미지를 여러 스케일로 처리하여 인식률 향상
      const scales = [1.5, 2.0, 2.5, 1.2]; // 여러 스케일 시도
      let bestResult: OCRResult | null = null;
      
      for (const scale of scales) {
        console.log(`📊 스케일 ${scale}x로 처리 중...`);
        try {
          const result = await this.processImageAtScale(imageFile, scale);
          if (result.totalAmount > 0) {
            console.log(`✅ 스케일 ${scale}x에서 성공: 총액 ${result.totalAmount}원`);
            bestResult = result;
            break; // 첫 번째 성공한 결과 사용
          }
        } catch (error) {
          console.warn(`⚠️ 스케일 ${scale}x 처리 실패:`, error);
        }
      }
      
      return bestResult || { totalAmount: 0, items: [] };
    } catch (error) {
      console.error('OCR 처리 오류:', error);
      return { totalAmount: 0, items: [] };
    }
  }

  /**
   * 특정 스케일로 이미지 처리
   */
  private async processImageAtScale(imageFile: File, scale: number): Promise<OCRResult> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context를 생성할 수 없습니다');

    // 이미지 로드
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // 캔버스 크기 설정
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // 이미지 그리기
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // 대비 강화 적용
          this.enhanceImageContrast(ctx, canvas.width, canvas.height);
          
          // OCR 실행
          const result = await Tesseract.recognize(canvas, 'kor+eng', {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                console.log(`OCR 진행률: ${(m.progress * 100).toFixed(1)}%`);
              }
            }
          });
          
          const text = result.data.text;
          console.log('📄 인식된 텍스트:', text);
          
          // 텍스트에서 총액과 항목 추출
          const totalAmount = this.extractTotalAmount(text);
          const items = this.extractItems(text);
          
          URL.revokeObjectURL(imageUrl);
          resolve({ totalAmount, items });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('이미지를 로드할 수 없습니다'));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * 총액 추출 - 더 유연한 키워드 검색
   */
  private extractTotalAmount(text: string): number {
    console.log('💰 총액 추출 시작...');
    
    const lines = text.split('\n');
    
    // 한국어 총액 키워드들 (더 유연한 매칭)
    const totalKeywords = [
      '합계', '총액', '총합', '결제금액', '지불금액',
      '합 계', '총 액', '총 합', '결제 금액', '지불 금액',
      '한 게', '총 액', '합 게', '결 제'  // OCR 오인식 패턴
    ];
    
    // 1단계: 키워드 기반 검색
    for (const line of lines) {
      const cleanLine = line.trim().replace(/\s+/g, ' '); // 여러 공백을 하나로
      if (!cleanLine) continue;
      
      console.log(`📋 라인 검사: "${cleanLine}"`);
      
      // 각 키워드별로 검사 (부분 매칭)
      for (const keyword of totalKeywords) {
        if (cleanLine.includes(keyword)) {
          console.log(`🎯 키워드 "${keyword}" 발견!`);
          
          // 해당 라인에서 숫자 추출 (더 관대한 패턴)
          const amounts = this.extractAmountsFromLine(cleanLine);
          if (amounts.length > 0) {
            const amount = Math.max(...amounts);
            console.log(`✅ 총액 발견: ${amount}원 (키워드: ${keyword})`);
            return amount;
          }
        }
      }
    }
    
    // 2단계: 빈도 기반 총액 검색 (콤마 패턴)
    console.log('🔍 빈도 기반 총액 검색 중...');
    const amountCounts = new Map<number, number>(); // 금액 → 등장횟수
    
    for (const line of lines) {
      const cleanLine = line.trim();
      // 콤마가 포함된 숫자 패턴 찾기 (예: "198,000" 또는 "198, 000")
      const commaPattern = /(\d{1,3},\s*\d{3,})/g;
      const matches = cleanLine.match(commaPattern);
      if (matches) {
        for (const match of matches) {
          const cleanNumber = match.replace(/[,\s]/g, '');
          const amount = parseInt(cleanNumber);
          if (amount >= 1000) { // 최소 1천원 이상
            const currentCount = amountCounts.get(amount) || 0;
            amountCounts.set(amount, currentCount + 1);
            console.log(`💰 콤마 패턴 발견: ${amount}원 (${match}) → 총 ${currentCount + 1}회`);
          }
        }
      }
    }
    
    if (amountCounts.size > 0) {
      // 빈도 정보 출력
      console.log('📊 금액별 등장 횟수:');
      for (const [amount, count] of amountCounts.entries()) {
        console.log(`  ${amount}원: ${count}회`);
      }
      
      // 가장 많이 등장한 금액들 찾기
      const maxCount = Math.max(...amountCounts.values());
      const mostFrequentAmounts: number[] = [];
      
      for (const [amount, count] of amountCounts.entries()) {
        if (count === maxCount) {
          mostFrequentAmounts.push(amount);
        }
      }
      
      // 가장 많이 등장한 금액들 중 최대값 선택
      const totalAmount = Math.max(...mostFrequentAmounts);
      console.log(`✅ 빈도 기반 총액 결정: ${totalAmount}원 (빈도 ${maxCount}회 + 최대값)`);
      return totalAmount;
    }
    
    // 3단계: 전체에서 최대 금액 찾기 
    console.log('⚠️ 키워드와 콤마 패턴 없음, 전체 최대값 검색...');
    const amounts = this.extractAllAmounts(text);
    const validAmounts = amounts.filter(amt => amt >= 1000); // 최소 1천원 이상
    
    if (validAmounts.length > 0) {
      const maxAmount = Math.max(...validAmounts);
      console.log(`💡 전체 최대값으로 총액 결정: ${maxAmount}원`);
      return maxAmount;
    }
    
    return 0;
  }

  /**
   * 라인에서 가장 큰 금액 추출
   */
  private extractLargestAmount(line: string): number {
    const amounts = this.extractAllAmounts(line);
    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }

  /**
   * 라인에서 모든 금액 추출 (더 관대한 패턴)
   */
  private extractAmountsFromLine(line: string): number[] {
    const amounts: number[] = [];
    
    // 다양한 금액 패턴 (점, 쉼표, 공백 허용)
    const patterns = [
      /(\d{1,3}[,]\d{3,})원?/g,         // "31,000원" 또는 "31,000"
      /(\d{1,3}[.]\d{3,})원?/g,         // "31.000원" 또는 "31.000" 
      /(\d{1,3}\s+\d{3,})원?/g,         // "31 000원" 또는 "31 000"
      /(\d{4,7})원?/g                   // "31000원" 또는 "31000"
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const cleanNumber = match[1].replace(/[,.\s]/g, ''); 
        const amount = parseInt(cleanNumber);
        
        // 유효한 금액 범위 확인
        if (amount >= 1000 && amount <= 1000000) {
          amounts.push(amount);
        }
      }
    }
    
    return [...new Set(amounts)]; // 중복 제거
  }

  /**
   * 텍스트에서 모든 금액 추출 (간단하고 확실한 패턴만)
   */
  private extractAllAmounts(text: string): number[] {
    const amounts: number[] = [];
    
    // 가장 일반적인 금액 패턴들
    const patterns = [
      /(\d{1,3},\d{3,})원/g,           // "31,000원"
      /(\d{4,7})원/g,                  // "31000원"
      /(\d{1,3},\d{3,})(?=\s|$)/g,    // "31,000" (끝에 있는)
      /(\d{4,7})(?=\s|$)/g            // "31000" (끝에 있는)
    ];
    
    for (const pattern of patterns) {
      let match;
      // global 플래그가 있으므로 while 루프 사용
      while ((match = pattern.exec(text)) !== null) {
        const cleanNumber = match[1].replace(/[,]/g, ''); // 쉼표만 제거
        const amount = parseInt(cleanNumber);
        
        // 유효한 금액 범위 확인 (1000원 ~ 1,000,000원)
        if (amount >= 1000 && amount <= 1000000) {
          amounts.push(amount);
        }
      }
    }
    
    return [...new Set(amounts)]; // 중복 제거
  }

  /**
   * 항목들 추출 (개선된 필터링)
   */
  private extractItems(text: string): Array<{name: string; price: number}> {
    console.log('🛒 항목 추출 시작...');
    
    // 총액을 미리 구해서 금액 보정에 활용
    const totalAmount = this.extractTotalAmount(text);
    console.log(`📊 참조 총액: ${totalAmount}원`);
    
    const items: Array<{name: string; price: number}> = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      
      // 가격이 포함된 라인인지 확인
      const amounts = this.extractAmountsFromLine(cleanLine);
      if (amounts.length === 0) continue;
      
      // 제외할 패턴들 (더 포괄적)
      const excludePatterns = [
        // 키워드가 포함된 라인 (총액/합계/세금)
        /합계|총액|총합|결제금액|지불금액|부\s*가\s*세|세금|한\s*게|합\s*게|결\s*제|과세|물품가액/,
        
        // 전화번호 패턴 (더 포괄적)
        /\d{2,4}[-\s]?\d{3,4}[-\s]?\d{4}|\(\d{2,4}\)\s?\d{3,4}[-\s]?\d{4}/,
        
        // 연락처 관련 키워드
        /세신|연락처|전화|TEL|CALL|문의/,
        
        // 날짜 패턴
        /\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4}/,
        
        // 시간 패턴
        /\d{1,2}:\d{2}(:\d{2})?/,
        
        // 승인번호나 거래번호 패턴 (긴 숫자)
        /\d{8,}/,
        
        // 카드번호 패턴
        /\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/,
        
        // 가맹점 정보
        /가맹점|승인|거래|결제|카드|SPIRIT|TING|Pay|현대카드|SOUS/i,
        
        // 주소 패턴
        /구\s|동\s|로\d+|길\s?\d+|서울|부산|대구|인천|광주|대전|울산/,
        
        // 사업자/업체 정보
        /사업자|업체|매장|지점|점포/,
        
        // 할부/포인트/적립 관련
        /할부기간|LPOINT|키드|적립|포인트|POINT/,
        
        // 승인번호/거래정보
        /SHAE|SH\s|ATH|AM\s/,
        
        // 영수증 구조적 요소
        /^[A-Za-z]{1,3}\s|^\d{1,3}[A-Za-z]\s|^gl\s|^Fil\s/,
        
        // 의미없는 단어들과 특수 패턴  
        /^[A-Za-z\s]+$|^[\d\s.,:-]+$|ER,\s*SE|bl\s*=|\|\s*=|EN\s*\(|대역|Beas/
      ];
      
      // 제외 패턴 검사
      const shouldExclude = excludePatterns.some(pattern => pattern.test(cleanLine));
      if (shouldExclude) {
        console.log(`❌ 제외된 라인: "${cleanLine}"`);
        continue;
      }
      
      // 상품명 패턴 검사 (실제 상품일 가능성 높은 패턴)
      const isLikelyProduct = this.isLikelyProduct(cleanLine);
      if (!isLikelyProduct) {
        console.log(`❌ 상품이 아닌 것으로 판단: "${cleanLine}"`);
        continue;
      }
      
      // 최소 금액만 체크 (상한선 제거)
      const validAmounts = amounts.filter(amt => amt >= 1000);
      if (validAmounts.length === 0) continue;
      
      let price = validAmounts[0]; // 첫 번째 유효한 금액 사용
      
      // 금액 보정: 항목이 1개이고 총액과 차이가 클 때 총액 사용
      if (totalAmount > 0) {
        const priceDiff = Math.abs(price - totalAmount);
        const diffRatio = priceDiff / totalAmount;
        
        // 차이가 50% 이상이면 총액 사용 (OCR 오인식 가능성 높음)
        if (diffRatio > 0.5) {
          console.log(`🔄 금액 보정: ${price}원 → ${totalAmount}원 (차이 ${(diffRatio * 100).toFixed(1)}%)`);
          price = totalAmount;
        }
      }
      
      // 상품명 추출 (숫자와 원 제거)
      let name = cleanLine
        .replace(/\d{1,3}[,.\s]\d{3,}원?|\d{4,7}원?/g, '') // 가격 제거
        .replace(/[₩\\]/g, '') // 특수문자 제거
        .trim();
      
      // 유효한 상품명 검증
      if (name.length >= 2 && name.length <= 50 && !/^[\s.,:-]+$/.test(name)) {
        items.push({ name, price });
        console.log(`🏷️ 항목: ${name} - ${price}원`);
      } else {
        console.log(`❌ 유효하지 않은 상품명: "${name}"`);
      }
    }
    
    return items;
  }

  /**
   * 이미지 대비 강화
   */
  private enhanceImageContrast(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // 대비 강화 계수 (1.0 = 원본, 1.5 = 50% 강화)
    const contrast = 1.5;
    const factor = (259 * (contrast + 1)) / (259 - contrast);
    
    for (let i = 0; i < data.length; i += 4) {
      // RGB 각 채널에 대비 강화 적용
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));     // Red
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128)); // Green
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128)); // Blue
      // Alpha는 그대로 유지 (data[i + 3])
    }
    
    ctx.putImageData(imageData, 0, 0);
    console.log('🎨 대비 강화 적용 완료');
  }

  /**
   * 상품명일 가능성 판단
   */
  private isLikelyProduct(line: string): boolean {
    // 너무 짧거나 긴 라인 제외
    if (line.length < 5 || line.length > 100) return false;
    
    // 한글이 포함된 라인 (상품명은 보통 한글 포함)
    const hasKorean = /[가-힣]/.test(line);
    
    // 숫자로만 구성된 라인 제외
    const isOnlyNumbers = /^[\d\s,.-]+$/.test(line);
    if (isOnlyNumbers) return false;
    
    // 특수문자만 있는 라인 제외
    const isOnlySpecialChars = /^[^\w가-힣]+$/.test(line);
    if (isOnlySpecialChars) return false;
    
    // 영수증 구조 요소 제외
    const structuralPatterns = [
      /^[A-Z]{1,4}\s*[A-Z]*\s*$/, // "gl A", "ATH" 등
      /^\d{1,3}[A-Za-z]\s*$/, // "2H", "310P" 등
      /^[A-Za-z]\s*님\s/, // "은 님" 등
    ];
    
    const isStructural = structuralPatterns.some(pattern => pattern.test(line));
    if (isStructural) return false;
    
    // 한글이 있고 위 조건들을 통과하면 상품일 가능성 높음
    return hasKorean;
  }
}

// 기본 export 유지
const ocrService = new OCRService();
export default ocrService;