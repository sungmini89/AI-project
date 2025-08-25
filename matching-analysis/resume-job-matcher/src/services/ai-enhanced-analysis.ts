import type { AnalysisResult, AnalysisOptions } from '@/types/analysis';

export interface AIProvider {
  name: string;
  endpoint?: string;
  apiKey?: string;
  available: boolean;
}

export interface EnhancedAnalysisResult extends AnalysisResult {
  aiInsights: {
    provider: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    confidenceScore: number;
  };
}

class AIEnhancedAnalysisService {
  private providers: AIProvider[] = [
    {
      name: 'OpenAI',
      available: !!import.meta.env.VITE_OPENAI_API_KEY,
    },
    {
      name: 'Cohere',
      available: !!import.meta.env.VITE_COHERE_API_KEY,
    },
    {
      name: 'Local Analysis',
      available: true, // Always available as fallback
    },
  ];

  private getAvailableProvider(): AIProvider {
    return this.providers.find(p => p.available) || this.providers[2];
  }

  async enhancedAnalysis(
    resumeText: string,
    jobDescription: string,
    baseAnalysis: AnalysisResult,
    _options: AnalysisOptions
  ): Promise<EnhancedAnalysisResult> {
    const provider = this.getAvailableProvider();
    
    try {
      let aiInsights;
      
      switch (provider.name) {
        case 'OpenAI':
          aiInsights = await this.analyzeWithOpenAI(resumeText, jobDescription, baseAnalysis);
          break;
        case 'Cohere':
          aiInsights = await this.analyzeWithCohere(resumeText, jobDescription, baseAnalysis);
          break;
        default:
          aiInsights = await this.localAnalysis(resumeText, jobDescription, baseAnalysis);
      }

      return {
        ...baseAnalysis,
        aiInsights,
      };
    } catch (error) {
      console.warn(`AI analysis failed with ${provider.name}, falling back to local analysis:`, error);
      
      const aiInsights = await this.localAnalysis(resumeText, jobDescription, baseAnalysis);
      
      return {
        ...baseAnalysis,
        aiInsights,
      };
    }
  }

  private async analyzeWithOpenAI(
    resumeText: string,
    jobDescription: string,
    baseAnalysis: AnalysisResult
  ) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    const prompt = this.buildAnalysisPrompt(resumeText, jobDescription, baseAnalysis);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in resume and job matching. Provide detailed, actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    return this.parseAIResponse(aiResponse, 'OpenAI');
  }

  private async analyzeWithCohere(
    resumeText: string,
    jobDescription: string,
    baseAnalysis: AnalysisResult
  ) {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    
    const prompt = this.buildAnalysisPrompt(resumeText, jobDescription, baseAnalysis);
    
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt,
        max_tokens: 1000,
        temperature: 0.3,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE',
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.generations[0].text;
    
    return this.parseAIResponse(aiResponse, 'Cohere');
  }

  private async localAnalysis(
    _resumeText: string,
    _jobDescription: string,
    baseAnalysis: AnalysisResult
  ) {
    // 로컬 분석 로직 - AI 없이 규칙 기반 분석
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // 점수 기반 분석
    if (baseAnalysis.overallScore >= 80) {
      strengths.push('전반적으로 요구사항과 잘 매칭됨');
    } else if (baseAnalysis.overallScore >= 60) {
      strengths.push('기본 요구사항 충족');
      recommendations.push('핵심 스킬 보완 필요');
    } else {
      weaknesses.push('주요 요구사항과 매칭도가 낮음');
      recommendations.push('해당 포지션에 맞는 스킬 개발 필요');
    }

    // 키워드 매칭 분석
    const keywordMatch = baseAnalysis.breakdown.keywordMatches;
    if (keywordMatch.matchRate >= 70) {
      strengths.push('키워드 매칭률이 우수함');
    } else if (keywordMatch.matchRate >= 50) {
      recommendations.push('중요 키워드 추가 보완');
    } else {
      weaknesses.push('핵심 키워드 부족');
      recommendations.push('직무 관련 키워드 보강 필요');
    }

    // 스킬 매칭 분석
    const skillMatch = baseAnalysis.breakdown.skillMatches;
    if (skillMatch.overallSkillMatch >= 70) {
      strengths.push('요구 기술 스택과 잘 일치함');
    } else {
      weaknesses.push('필수 기술 스킬 부족');
      recommendations.push('해당 분야 기술 스킬 학습 추천');
    }

    // ATS 호환성 분석
    const atsScore = baseAnalysis.breakdown.atsCompliance.score;
    if (atsScore >= 80) {
      strengths.push('ATS 시스템 통과 가능성 높음');
    } else {
      weaknesses.push('ATS 시스템 최적화 부족');
      recommendations.push('이력서 형식 및 키워드 최적화 필요');
    }

    return {
      provider: 'Local Analysis',
      summary: this.generateSummary(baseAnalysis.overallScore),
      strengths,
      weaknesses,
      recommendations,
      confidenceScore: Math.min(baseAnalysis.overallScore + 10, 100),
    };
  }

  private buildAnalysisPrompt(
    resumeText: string,
    jobDescription: string,
    baseAnalysis: AnalysisResult
  ): string {
    return `
분석 요청: 이력서와 채용공고 매칭 분석

기본 분석 결과:
- 전체 매칭 점수: ${baseAnalysis.overallScore}%
- 키워드 매칭: ${baseAnalysis.breakdown.keywordMatches.matchRate}%
- 스킬 매칭: ${baseAnalysis.breakdown.skillMatches.overallSkillMatch}%
- ATS 호환성: ${baseAnalysis.breakdown.atsCompliance.score}%

이력서 요약: ${resumeText.substring(0, 500)}...
채용공고 요약: ${jobDescription.substring(0, 500)}...

다음 형식으로 분석 결과를 제공해주세요:

SUMMARY: [전체적인 매칭 평가를 2-3문장으로]

STRENGTHS:
- [강점 1]
- [강점 2]
- [강점 3]

WEAKNESSES:
- [약점 1]
- [약점 2]
- [약점 3]

RECOMMENDATIONS:
- [개선 제안 1]
- [개선 제안 2]
- [개선 제안 3]

CONFIDENCE: [신뢰도 점수 0-100]
`;
  }

  private parseAIResponse(response: string, provider: string) {
    const sections = {
      summary: '',
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[],
      confidenceScore: 75, // 기본값
    };

    try {
      // Summary 추출
      const summaryMatch = response.match(/SUMMARY:\s*(.+?)(?=\n\n|\nSTRENGTHS:|\nWEAKNESSES:|$)/s);
      if (summaryMatch) {
        sections.summary = summaryMatch[1].trim();
      }

      // Strengths 추출
      const strengthsMatch = response.match(/STRENGTHS:\s*((?:\s*-\s*.+\n?)*)/s);
      if (strengthsMatch) {
        sections.strengths = strengthsMatch[1]
          .split('\n')
          .map(s => s.replace(/^\s*-\s*/, '').trim())
          .filter(s => s.length > 0);
      }

      // Weaknesses 추출
      const weaknessesMatch = response.match(/WEAKNESSES:\s*((?:\s*-\s*.+\n?)*)/s);
      if (weaknessesMatch) {
        sections.weaknesses = weaknessesMatch[1]
          .split('\n')
          .map(s => s.replace(/^\s*-\s*/, '').trim())
          .filter(s => s.length > 0);
      }

      // Recommendations 추출
      const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*((?:\s*-\s*.+\n?)*)/s);
      if (recommendationsMatch) {
        sections.recommendations = recommendationsMatch[1]
          .split('\n')
          .map(s => s.replace(/^\s*-\s*/, '').trim())
          .filter(s => s.length > 0);
      }

      // Confidence 추출
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      if (confidenceMatch) {
        sections.confidenceScore = parseInt(confidenceMatch[1], 10);
      }
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback:', error);
      sections.summary = '분석이 완료되었습니다.';
    }

    return {
      provider,
      ...sections,
    };
  }

  private generateSummary(score: number): string {
    if (score >= 80) {
      return '이력서가 채용공고 요구사항과 매우 잘 매칭되며, 지원 시 높은 경쟁력을 가질 것으로 예상됩니다.';
    } else if (score >= 60) {
      return '기본적인 요구사항은 충족하나, 일부 영역에서 보완이 필요합니다.';
    } else if (score >= 40) {
      return '부분적으로 매칭되나, 핵심 요구사항 보완이 필요합니다.';
    } else {
      return '현재 이력서는 해당 포지션 요구사항과 매칭도가 낮으며, 상당한 개선이 필요합니다.';
    }
  }

  getProviderStatus(): AIProvider[] {
    return this.providers;
  }
}

export const aiEnhancedAnalysisService = new AIEnhancedAnalysisService();