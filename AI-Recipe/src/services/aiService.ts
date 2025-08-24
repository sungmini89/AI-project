/**
 * AI 레시피 생성 서비스
 * OpenAI API를 사용하여 사용자 입력에 기반한 맞춤형 레시피를 생성합니다.
 * 
 * @description
 * - OpenAI GPT 모델을 사용한 레시피 생성
 * - 재료, 요리 스타일, 난이도 등 조건 기반 레시피 생성
 * - AI 서비스 실패 시 목 데이터로 자동 폴백
 * - 환경 변수를 통한 API 키 및 모델 설정
 * 
 * @features
 * - 맞춤형 프롬프트 생성
 * - JSON 응답 파싱 및 검증
 * - 오류 처리 및 폴백 메커니즘
 * - 다양한 요리 조건 지원
 * 
 * @author AI Recipe Team
 * @version 1.0.0
 */

import { Recipe } from '@/types'

/**
 * AI 레시피 생성 요청 인터페이스
 * 레시피 생성에 필요한 모든 조건을 정의합니다.
 */
export interface AIRecipeRequest {
  /** 사용 가능한 재료 목록 */
  ingredients: string[]
  /** 요리 스타일/종류 */
  cuisine?: string
  /** 조리 난이도 */
  difficulty?: 'easy' | 'medium' | 'hard'
  /** 최대 조리 시간 (분) */
  cookingTime?: number
  /** 인분 수 */
  servings?: number
  /** 식이 제한 사항 */
  dietaryRestrictions?: string[]
  /** 선호하는 요리 스타일 */
  preferredStyle?: string
}

/**
 * AI 서비스 응답 인터페이스
 * 레시피 생성 결과를 표준화된 형식으로 반환합니다.
 */
export interface AIServiceResponse {
  /** 요청 성공 여부 */
  success: boolean
  /** 생성된 레시피 데이터 */
  data?: Recipe
  /** 오류 메시지 (실패 시) */
  error?: string
  /** 데이터 출처 (ai 또는 mock) */
  source: 'ai' | 'mock'
}

/**
 * AI 레시피 생성 서비스 클래스
 * OpenAI API와 통신하여 맞춤형 레시피를 생성합니다.
 */
class AIService {
  /** OpenAI API 키 */
  private apiKey: string | null
  /** 사용할 AI 모델 */
  private model: string
  /** OpenAI API 기본 URL */
  private baseUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null
    this.model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini'
    this.baseUrl = 'https://api.openai.com/v1'
  }

  /**
   * AI 서비스 사용 가능 여부 확인
   * API 키 존재 여부와 서비스 모드를 확인합니다.
   * 
   * @returns {boolean} AI 서비스 사용 가능 여부
   */
  private isAIEnabled(): boolean {
    return Boolean(this.apiKey && import.meta.env.VITE_AI_SERVICE_MODE !== 'offline')
  }

  /**
   * AI를 사용하여 레시피 생성
   * 
   * @param {AIRecipeRequest} request - 레시피 생성 요청 조건
   * @returns {Promise<AIServiceResponse>} 생성된 레시피 또는 오류 정보
   */
  async generateRecipe(request: AIRecipeRequest): Promise<AIServiceResponse> {
    if (!this.isAIEnabled()) {
      return this.generateMockRecipe(request)
    }

    try {
      const prompt = this.buildPrompt(request)
      const response = await this.callOpenAI(prompt)
      const recipe = this.parseRecipeFromResponse(response, request)

      return {
        success: true,
        data: recipe,
        source: 'ai'
      }
    } catch (error) {
      console.error('AI 레시피 생성 실패:', error)
      
      // AI 실패 시 목 데이터로 폴백
      return this.generateMockRecipe(request)
    }
  }

  /**
   * AI 프롬프트 생성
   * 사용자 요청을 바탕으로 구조화된 프롬프트를 생성합니다.
   * 
   * @param {AIRecipeRequest} request - 레시피 생성 요청
   * @returns {string} 생성된 프롬프트
   */
  private buildPrompt(request: AIRecipeRequest): string {
    const {
      ingredients,
      cuisine = '아무거나',
      difficulty = 'medium',
      cookingTime = 30,
      servings = 2,
      dietaryRestrictions = [],
      preferredStyle = '일반적인'
    } = request

    return `당신은 전문 요리사입니다. 다음 조건으로 레시피를 만들어 주세요:

**재료**: ${ingredients.join(', ')}
**요리 스타일**: ${cuisine}
**난이도**: ${difficulty}
**조리 시간**: ${cookingTime}분 이내
**인분**: ${servings}명분
**식이 제한**: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : '없음'}
**선호 스타일**: ${preferredStyle}

다음 JSON 형식으로만 답변해 주세요:

{
  "title": "레시피 제목",
  "description": "레시피 간단 설명",
  "ingredients": ["재료1", "재료2", "재료3"],
  "instructions": ["1단계", "2단계", "3단계"],
  "readyInMinutes": 30,
  "servings": 2,
  "difficulty": "medium",
  "tags": ["태그1", "태그2"],
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbohydrates": "30g",
    "fat": "15g"
  }
}`
  }

  /**
   * OpenAI API 호출
   * 생성된 프롬프트를 OpenAI API로 전송합니다.
   * 
   * @param {string} prompt - AI에게 전송할 프롬프트
   * @returns {Promise<string>} AI 응답 텍스트
   */
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 없습니다')
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '당신은 한국어로 답변하는 전문 요리사입니다. 항상 JSON 형식으로만 답변하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 오류: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  private parseRecipeFromResponse(response: string, request: AIRecipeRequest): Recipe {
    try {
      // JSON 부분만 추출
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('JSON 형식을 찾을 수 없습니다')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        id: `ai-${Date.now()}`,
        title: parsed.title || '생성된 레시피',
        description: parsed.description || '맛있는 레시피입니다',
        summary: parsed.description || '맛있는 레시피입니다',
        ingredients: parsed.ingredients || request.ingredients,
        instructions: parsed.instructions || ['조리 방법을 생성하지 못했습니다'],
        readyInMinutes: parsed.readyInMinutes || request.cookingTime || 30,
        servings: parsed.servings || request.servings || 2,
        difficulty: parsed.difficulty || request.difficulty || 'medium',
        tags: parsed.tags || [request.cuisine || '일반', '생성됨'],
        nutrition: parsed.nutrition || {
          calories: 300,
          protein: 20,
          carbohydrates: 25,
          fat: 12,
          fiber: 3,
          sodium: 500
        },
        image: `/api/placeholder/400/300?recipe=${encodeURIComponent(parsed.title)}`,
        source: 'ai-generated'
      }
    } catch (error) {
      console.error('레시피 파싱 실패:', error)
      return this.createFallbackRecipe(request)
    }
  }

  private generateMockRecipe(request: AIRecipeRequest): AIServiceResponse {
    const mockRecipe = this.createFallbackRecipe(request)
    
    return {
      success: true,
      data: mockRecipe,
      source: 'mock'
    }
  }

  private createFallbackRecipe(request: AIRecipeRequest): Recipe {
    const mainIngredient = request.ingredients[0] || '재료'
    
    return {
      id: `mock-${Date.now()}`,
      title: `${mainIngredient}을(를) 활용한 레시피`,
      description: `${request.ingredients.join(', ')}을(를) 사용한 맛있는 요리입니다.`,
      summary: `${request.ingredients.join(', ')}을(를) 사용한 맛있는 요리입니다.`,
      ingredients: [
        ...request.ingredients,
        '소금 약간',
        '후추 약간',
        '식용유 2큰술'
      ],
      instructions: [
        '재료를 깨끗이 씻어 준비합니다.',
        '팬에 식용유를 두르고 중불에서 가열합니다.',
        '준비한 재료를 넣고 볶습니다.',
        '소금과 후추로 간을 맞춥니다.',
        '완성된 요리를 그릇에 담아 서빙합니다.'
      ],
      readyInMinutes: request.cookingTime || 30,
      servings: request.servings || 2,
      difficulty: request.difficulty || 'medium',
      tags: [request.cuisine || '일반', '간편요리', '생성됨'],
      nutrition: {
        calories: 250,
        protein: 15,
        carbohydrates: 20,
        fat: 10,
        fiber: 2,
        sodium: 400
      },
      image: `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop`,
      source: 'ai-mock'
    }
  }
}

export const aiService = new AIService()