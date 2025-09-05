var c=Object.defineProperty;var m=(o,e,t)=>e in o?c(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var s=(o,e,t)=>m(o,typeof e!="symbol"?e+"":e,t);import{G as u}from"./ai-DlT_pbP0.js";class l{constructor(){s(this,"genAI",null);s(this,"model",null);s(this,"requestCount",0);s(this,"dailyLimit",60);s(this,"lastRequestTime",0);s(this,"minInterval",1e3);this.loadRequestCount()}initialize(e){if(!e.apiKey||e.apiKey==="optional"){console.warn("Gemini API 키가 설정되지 않았습니다. OCR 결과 개선 기능을 사용할 수 없습니다.");return}try{this.genAI=new u(e.apiKey),this.model=this.genAI.getGenerativeModel({model:e.model||"gemini-pro",generationConfig:{temperature:e.temperature||.1,maxOutputTokens:e.maxOutputTokens||1e3}})}catch(t){throw console.error("Gemini 초기화 실패:",t),t}}async enhanceOCRResult(e,t){if(!this.isAvailable())throw new Error("Gemini API를 사용할 수 없습니다");await this.checkRateLimit();const n=this.createEnhancementPrompt(e,t);try{const a=(await(await this.model.generateContent(n)).response).text();return this.incrementRequestCount(),this.parseGeminiResponse(a)}catch(i){throw console.error("Gemini OCR 개선 실패:",i),i}}async extractReceiptInfo(e){if(!this.isAvailable())throw new Error("Gemini API를 사용할 수 없습니다");await this.checkRateLimit();const t=this.createExtractionPrompt(e);try{const r=(await(await this.model.generateContent(t)).response).text();return this.incrementRequestCount(),this.parseGeminiResponse(r)}catch(n){throw console.error("Gemini 영수증 추출 실패:",n),n}}createEnhancementPrompt(e,t){return`
다음은 한국어 영수증에서 OCR로 추출한 텍스트와 자동으로 파싱한 항목들입니다.
이를 분석하여 더 정확한 정보를 제공해주세요.

OCR 원본 텍스트:
${e}

현재 파싱된 항목들:
${t.map(n=>`- ${n.name}: ${n.price}원`).join(`
`)}

요청사항:
1. 항목명이 잘못 인식된 경우 올바른 이름으로 수정
2. 가격이 잘못 추출된 경우 수정
3. 누락된 항목이 있다면 추가
4. 총액 확인 및 수정
5. 개선 사항 및 제안사항 제공

다음 JSON 형식으로 응답해주세요:
{
  "items": [
    {
      "name": "항목명",
      "price": 가격숫자,
      "confidence": 0.9
    }
  ],
  "totalAmount": 총액숫자,
  "confidence": 0.85,
  "corrections": ["수정사항1", "수정사항2"],
  "suggestions": ["제안사항1", "제안사항2"]
}
`}createExtractionPrompt(e){return`
다음은 한국어 영수증에서 추출한 OCR 텍스트입니다.
이 텍스트를 분석하여 구매 항목과 가격을 정확하게 추출해주세요.

OCR 텍스트:
${e}

추출 기준:
1. 메뉴/상품명과 가격이 명확한 항목만 추출
2. 세금, 봉사료, 할인 등은 별도 표시
3. 총액 정확히 계산
4. 애매한 부분은 신뢰도를 낮게 설정

다음 JSON 형식으로 응답해주세요:
{
  "items": [
    {
      "name": "정확한 항목명",
      "price": 가격숫자,
      "confidence": 신뢰도 (0.0-1.0)
    }
  ],
  "totalAmount": 총액숫자,
  "confidence": 전체신뢰도,
  "corrections": ["OCR에서 수정된 부분들"],
  "suggestions": ["추가 확인이 필요한 부분들"]
}
`}parseGeminiResponse(e){try{const t=e.match(/\{[\s\S]*\}/);if(!t)throw new Error("유효한 JSON 응답이 없습니다");const n=JSON.parse(t[0]);return{items:n.items.map((r,a)=>({id:`gemini-${Date.now()}-${a}`,name:r.name,price:r.price,quantity:1,confidence:r.confidence||.8})),totalAmount:n.totalAmount||0,confidence:n.confidence||.8,corrections:n.corrections||[],suggestions:n.suggestions||[]}}catch(t){throw console.error("Gemini 응답 파싱 실패:",t),new Error("Gemini 응답을 해석할 수 없습니다")}}isAvailable(){return this.genAI!==null&&this.model!==null}async checkRateLimit(){if(this.requestCount>=this.dailyLimit)throw new Error(`일일 API 사용 한도(${this.dailyLimit}회)를 초과했습니다`);const t=Date.now()-this.lastRequestTime;if(t<this.minInterval){const n=this.minInterval-t;await new Promise(i=>setTimeout(i,n))}this.lastRequestTime=Date.now()}incrementRequestCount(){this.requestCount++,this.saveRequestCount()}loadRequestCount(){try{const e=new Date().toDateString(),t=localStorage.getItem("gemini-usage");if(t){const n=JSON.parse(t);n.date===e?this.requestCount=n.count:this.requestCount=0}}catch(e){console.warn("Gemini 사용량 로드 실패:",e),this.requestCount=0}}saveRequestCount(){try{const t={date:new Date().toDateString(),count:this.requestCount};localStorage.setItem("gemini-usage",JSON.stringify(t))}catch(e){console.warn("Gemini 사용량 저장 실패:",e)}}getUsageInfo(){return{requestCount:this.requestCount,dailyLimit:this.dailyLimit,remaining:this.dailyLimit-this.requestCount,isAvailable:this.isAvailable()}}resetUsage(){this.requestCount=0,localStorage.removeItem("gemini-usage")}}const d=new l;export{d as default,d as geminiService};
