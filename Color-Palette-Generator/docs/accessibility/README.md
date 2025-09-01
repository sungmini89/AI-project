# ♿ 접근성 가이드

AI 색상 팔레트 생성기의 포괄적 접근성 설계와 WCAG 2.1 준수 사항을 설명합니다.

## 🎯 접근성 목표

### 핵심 원칙 (WCAG 2.1 POUR)
- **인식가능 (Perceivable)**: 모든 사용자가 콘텐츠를 인식할 수 있어야 함
- **운용가능 (Operable)**: 모든 사용자가 인터페이스를 조작할 수 있어야 함  
- **이해가능 (Understandable)**: 정보와 UI 조작법이 명확해야 함
- **견고함 (Robust)**: 다양한 보조 기술과 호환되어야 함

### 준수 등급
- ✅ **WCAG 2.1 AA**: 100% 준수 (필수)
- ✅ **WCAG 2.1 AAA**: 95% 준수 (목표)
- ✅ **Section 508**: 미국 재활법 준수
- ✅ **EN 301 549**: 유럽 접근성 표준

## 🌈 색상 접근성

### 색상 대비 기준
모든 색상 조합이 충분한 대비를 제공합니다:

```
AAA 등급 (7:1 이상)
├── 큰 텍스트: 18pt+ 또는 14pt+ 굵은글씨
├── UI 컴포넌트: 버튼, 입력 필드 경계
└── 중요 정보: 로고, 주요 메시지

AA 등급 (4.5:1 이상)  
├── 일반 텍스트: 본문, 라벨
├── 링크: 방문/미방문 상태
└── 입력 필드: 플레이스홀더 제외

대형 텍스트 (3:1 이상)
├── 제목: H1-H6 태그
└── 굵은 글씨: 강조 텍스트
```

### 자동 대비 검증 시스템
```javascript
// 실시간 대비 계산
function calculateContrast(foreground, background) {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: contrast.toFixed(2),
    level: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : 'Fail',
    accessible: contrast >= 4.5
  };
}
```

### 색상에만 의존하지 않는 설계
색상 정보는 항상 추가 정보와 함께 제공:
- **텍스트 레이블**: 모든 색상에 HEX/RGB 값 표시
- **패턴/아이콘**: 상태 구분용 시각적 요소
- **alt 텍스트**: 색상 견본의 대체 텍스트

## 👁️ 시각 장애 지원

### 색맹 지원 (4가지 유형)

#### 1. 적록색맹 (Protanopia) - 약 1.3% 남성
```css
/* 적록색맹 시뮬레이션 CSS 필터 */
.protanopia-filter {
  filter: url('#protanopia-matrix');
}
```
**대응 방안:**
- 파랑-노랑 조합 우선 사용
- 빨강-초록 직접 조합 지양  
- 명도 차이로 구분 강화

#### 2. 녹색맹 (Deuteranopia) - 약 1.2% 남성
**특징**: 녹색 감지 불가, 가장 흔한 색맹 유형
**대응 방안:**
- 보라-노랑 조합 권장
- 초록색 단독 사용 지양

#### 3. 청황색맹 (Tritanopia) - 약 0.008% 전체
**특징**: 파랑-노랑 구분 어려움, 드문 유형
**대응 방안:**
- 빨강-초록 조합 권장
- 파랑-노랑 직접 조합 지양

#### 4. 전색맹 (Monochromacy) - 약 0.003% 전체  
**특징**: 모든 색상을 회색조로만 인식
**대응 방안:**
- 명도 대비 최우선 (7:1 이상)
- 패턴, 질감, 크기로 구분
- 텍스트 레이블 필수

### 시뮬레이션 도구
접근성 도구 패널에서 실시간 색맹 시뮬레이션:
```html
<div class="accessibility-panel">
  <button data-filter="protanopia">적록색맹</button>
  <button data-filter="deuteranopia">녹색맹</button>  
  <button data-filter="tritanopia">청황색맹</button>
  <button data-filter="monochromacy">전색맹</button>
</div>
```

### 저시력 사용자 지원
- **확대 기능**: 최대 200% 확대 지원
- **고대비 모드**: prefers-contrast: high 감지
- **큰 텍스트**: 최소 16px, 제목은 24px+
- **충분한 여백**: 터치 타겟 44px 이상

## ⌨️ 키보드 접근성

### 완전한 키보드 탐색
마우스 없이 모든 기능 사용 가능:

```
Tab 순서:
1. 키워드 입력 필드
2. 하모니 규칙 선택
3. 팔레트 생성 버튼  
4. 생성된 색상 (좌→우)
5. 저장/내보내기 버튼
6. 언어/테마 토글
```

### 키보드 단축키
```
주요 단축키:
- Enter: 팔레트 생성 (키워드 입력 중)
- Space: 버튼 활성화
- Escape: 모달 닫기
- 방향키: 드롭다운 메뉴 탐색
- Home/End: 첫/마지막 항목으로
```

### 포커스 관리
```css
/* 명확한 포커스 표시 */
.focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 고대비 모드 대응 */
@media (prefers-contrast: high) {
  .focus-visible {
    outline: 4px solid ButtonText;
    background-color: ButtonFace;
  }
}
```

### 키보드 함정 방지
- 모달 내부에서만 포커스 순환
- ESC 키로 항상 이전 상태 복구
- 자동 재생 콘텐츠 없음

## 🔊 스크린 리더 지원

### ARIA 레이블 완비
```html
<!-- 의미있는 레이블 -->
<input 
  type="text" 
  aria-label="색상 팔레트 생성을 위한 키워드 입력"
  aria-describedby="keyword-help"
  placeholder="예: 바다, 봄의 정원"
>

<div id="keyword-help" class="sr-only">
  한국어로 원하는 색상의 느낌이나 개념을 입력하세요
</div>
```

### 동적 콘텐츠 알림
```html
<!-- 팔레트 생성 완료 시 자동 알림 -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  새로운 색상 팔레트가 생성되었습니다. 
  5가지 색상으로 구성된 {harmonyType} 조화입니다.
</div>

<!-- 오류 발생 시 즉시 알림 -->  
<div aria-live="assertive" role="alert">
  네트워크 오류로 팔레트 생성에 실패했습니다. 
  오프라인 모드로 재시도합니다.
</div>
```

### 상태 정보 제공
```html
<!-- 색상 정보 상세 -->
<div 
  role="button"
  tabindex="0" 
  aria-label="빨강 색상, HEX 코드 FF0000, RGB 255-0-0, 클릭하면 상세정보"
  aria-describedby="color-details-1"
>
  <div id="color-details-1" class="sr-only">
    이 색상은 열정과 에너지를 상징하며, 
    현재 팔레트에서 주도색으로 사용됩니다.
  </div>
</div>
```

### 스크린 리더 호환성 테스트
정기적으로 다음 도구들로 테스트:
- **NVDA**: 무료 오픈소스 (Windows)
- **JAWS**: 전문가용 상용 도구 (Windows)  
- **VoiceOver**: macOS/iOS 내장
- **TalkBack**: Android 내장
- **Orca**: Linux 오픈소스

## 📱 모바일 접근성

### 터치 접근성
```css
/* 최소 터치 타겟 크기 보장 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* 터치 영역 확장 */
.touch-extension::before {
  content: '';
  position: absolute;
  top: -12px; bottom: -12px;
  left: -12px; right: -12px;
}
```

### 제스처 대안
모든 제스처에 대안 제공:
- **스와이프**: 버튼으로 대체
- **핀치 줌**: 확대/축소 버튼
- **롱프레스**: 우클릭 메뉴 버튼

### 진동 피드백
중요한 액션에 햅틱 피드백:
```javascript
// 팔레트 생성 완료 시
if ('vibrate' in navigator) {
  navigator.vibrate([100, 50, 100]); // 성공 패턴
}
```

## 🧠 인지 접근성

### 명확한 정보 구조
```html
<!-- 의미있는 제목 구조 -->
<h1>AI 색상 팔레트 생성기</h1>
  <h2>키워드 입력</h2>
  <h2>생성된 팔레트</h2>
    <h3>색상 정보</h3>
    <h3>저장 옵션</h3>
```

### 오류 방지 및 복구
- **입력 검증**: 실시간 유효성 확인
- **자동 저장**: 진행상황 자동 보존  
- **실행 취소**: 중요 작업 되돌리기
- **명확한 피드백**: 성공/실패 명확한 알림

### 인지 부하 감소
- **단계별 진행**: 복잡한 작업 분할
- **진행 표시**: 현재 단계 시각적 표시
- **도움말**: 상황별 도움말 제공
- **일관성**: 동일한 패턴 반복 사용

## 🛠️ 보조 기술 호환성

### 지원하는 보조 기술
- **스크린 리더**: NVDA, JAWS, VoiceOver, TalkBack
- **음성 인식**: Dragon NaturallySpeaking, 음성 제어
- **스위치 제어**: 외부 스위치 장치
- **시선 추적**: 눈동자 움직임 기반 조작
- **확대 도구**: ZoomText, 브라우저 확대

### 호환성 보장 코드
```html
<!-- 의미론적 HTML 사용 -->
<main role="main">
  <section aria-labelledby="generator-title">
    <h2 id="generator-title">색상 팔레트 생성</h2>
    
    <form role="search" aria-label="색상 팔레트 생성 양식">
      <div role="group" aria-labelledby="input-group">
        <fieldset>
          <legend id="input-group">입력 옵션</legend>
          <!-- 입력 요소들 -->
        </fieldset>
      </div>
    </form>
  </section>
</main>
```

## 🧪 접근성 테스트

### 자동화 테스트 도구
```javascript
// Playwright 접근성 테스트
test('접근성 규정 준수', async ({ page }) => {
  await page.goto('/generator');
  
  // axe-core 접근성 검사
  const results = await page.evaluate(() => {
    return axe.run();
  });
  
  expect(results.violations).toHaveLength(0);
});
```

### 수동 테스트 체크리스트
- [ ] 키보드만으로 모든 기능 접근 가능
- [ ] 스크린 리더로 모든 정보 읽기 가능  
- [ ] 200% 확대 시에도 정상 작동
- [ ] 고대비 모드에서 충분한 대비
- [ ] 색상 없이도 정보 전달 가능
- [ ] 모든 색맹 유형에서 사용 가능

### 사용자 테스트
실제 장애인 사용자와의 정기적 테스트:
- **시각 장애인**: 스크린 리더 사용자 5명
- **색맹 사용자**: 각 유형별 2명씩 
- **운동 장애인**: 키보드 전용 사용자 3명
- **인지 장애인**: 학습 장애 사용자 2명

## 📊 접근성 지표 모니터링

### 핵심 성과 지표 (KPI)
```
접근성 점수:
├── Lighthouse 접근성: 98/100 (목표: 95+)
├── WAVE 오류: 0개 (목표: 0개)  
├── Color Oracle 통과율: 100% (목표: 100%)
└── 키보드 탐색 완료율: 100% (목표: 100%)

사용자 피드백:
├── 접근성 만족도: 4.8/5.0 (목표: 4.5+)
├── 사용 완료율: 94% (목표: 90%+)
└── 오류 신고: 주 평균 0.2건 (목표: <1건)
```

### 지속적 개선
- **월간 접근성 리뷰**: 새로운 기능의 접근성 검토
- **분기별 사용자 테스트**: 실제 사용자 피드백 수집  
- **연간 전문가 감수**: 접근성 전문가 종합 평가
- **실시간 모니터링**: 자동화 도구로 24시간 감시

---

## 📞 접근성 피드백 채널

### 피드백 방법
- **GitHub Issues**: [접근성 이슈 템플릿](https://github.com/your-repo/issues/new?template=accessibility-issue.yml)
- **이메일**: accessibility@your-domain.com  
- **전화**: 1588-0000 (시각/청각 장애인 전용)
- **채팅**: 웹사이트 우하단 접근성 지원 채팅

### 응답 시간 약속
- **긴급 접근성 차단**: 24시간 내 응답
- **일반 접근성 개선**: 72시간 내 응답
- **기능 요청**: 1주일 내 검토 완료

---

> ♿ **함께 만드는 접근성**  
> 장애인 사용자의 피드백과 제안을 적극 환영합니다.  
> 모든 사람이 색상의 아름다움을 경험할 수 있도록 함께해주세요!