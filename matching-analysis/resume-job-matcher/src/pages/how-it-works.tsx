import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { MagicCard } from '@/components/ui/magic-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import AnimatedCircularProgressBar from '@/components/ui/animated-circular-progress-bar';
import {
  Brain,
  FileText,
  Search,
  Target,
  Zap,
  CheckCircle,
  Award,
  BarChart3,
  Eye,
  Filter,
  Layers,
  Sparkles,
  Activity
} from 'lucide-react';
import { Navigation } from '@/components/navigation/Navigation';

export default function HowItWorks() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('overview');

  const algorithmSteps = [
    {
      id: 'text-extraction',
      title: '텍스트 추출 & 전처리',
      icon: FileText,
      description: 'PDF 파싱 및 자연어 처리를 통한 텍스트 정규화',
      details: [
        'PDF.js를 활용한 정확한 텍스트 추출',
        '특수문자 및 포맷팅 제거',
        '언어별 토크나이징 처리',
        '구문 분석 및 개체명 인식'
      ],
      color: 'from-blue-500 to-cyan-600',
      accuracy: 98
    },
    {
      id: 'keyword-analysis',
      title: '키워드 가중치 분석',
      icon: Search,
      description: 'TF-IDF 및 의미 분석을 통한 핵심 키워드 추출',
      details: [
        'Term Frequency-Inverse Document Frequency 계산',
        '기술 스택별 가중치 매트릭스 적용',
        '동의어 및 관련어 매칭',
        '문맥적 중요도 평가'
      ],
      color: 'from-green-500 to-emerald-600',
      accuracy: 94
    },
    {
      id: 'semantic-matching',
      title: '의미론적 매칭',
      icon: Brain,
      description: '자연어 이해를 통한 심층 의미 분석',
      details: [
        'Word2Vec 벡터 공간에서의 유사도 계산',
        '문장 임베딩을 통한 맥락 이해',
        '기술 도메인별 특화 모델 적용',
        '경력 수준 및 요구사항 매칭'
      ],
      color: 'from-purple-500 to-pink-600',
      accuracy: 91
    },
    {
      id: 'ats-optimization',
      title: 'ATS 호환성 검증',
      icon: Target,
      description: 'Applicant Tracking System 최적화 분석',
      details: [
        '키워드 밀도 및 분포 분석',
        '포맷팅 및 구조 평가',
        '스캐닝 알고리즘 호환성 검증',
        'HR 시스템 통과율 예측'
      ],
      color: 'from-orange-500 to-red-600',
      accuracy: 89
    },
    {
      id: 'scoring-engine',
      title: '종합 점수 산출',
      icon: Award,
      description: '다차원 평가 모델을 통한 최종 매칭 점수',
      details: [
        '가중 평균 기반 종합 점수',
        '카테고리별 세부 점수 제공',
        '개선 우선순위 도출',
        '액션 아이템 자동 생성'
      ],
      color: 'from-indigo-500 to-blue-600',
      accuracy: 96
    }
  ];

  const metrics = [
    { name: '정확도', value: 94.2, description: '매칭 예측 정확도', color: 'text-green-600' },
    { name: '처리 속도', value: 98.7, description: '평균 응답 시간 (2초)', color: 'text-blue-600' },
    { name: 'ATS 호환성', value: 89.3, description: 'ATS 통과 예측률', color: 'text-purple-600' },
    { name: '사용자 만족도', value: 96.8, description: '개선 후 만족도', color: 'text-orange-600' }
  ];

  const analysisExample = {
    resume: {
      title: '프론트엔드 개발자 이력서',
      keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Git'],
      experience: '3년',
      skills: ['웹 개발', '반응형 디자인', '컴포넌트 설계']
    },
    jobPosting: {
      title: '프론트엔드 개발자 채용',
      requirements: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
      experience: '3-5년',
      preferred: ['백엔드 경험', 'DevOps 지식']
    },
    analysis: {
      keywordMatch: 65,
      skillMatch: 72,
      experienceMatch: 95,
      atsScore: 85,
      overall: 78
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <section className="relative px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <Navigation showAPIStatus={false} />

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI 매칭 알고리즘
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              첨단 자연어 처리 기술과 머신러닝을 활용하여 
              이력서와 채용공고의 매칭률을 정밀하게 분석하는 과정을 알아보세요.
            </p>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-12 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <MagicCard
                key={index}
                className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BorderBeam delay={index * 0.2} />
                
                <div className="mb-4">
                  <AnimatedCircularProgressBar
                    value={metric.value}
                    max={100}
                    className="w-20 h-20 mx-auto"
                    gaugePrimaryColor={
                      metric.color.includes('green') ? 'rgb(34 197 94)' :
                      metric.color.includes('blue') ? 'rgb(59 130 246)' :
                      metric.color.includes('purple') ? 'rgb(168 85 247)' :
                      'rgb(249 115 22)'
                    }
                    gaugeSecondaryColor="rgb(229 231 235)"
                  />
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{metric.name}</h3>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
                <div className={`text-2xl font-bold ${metric.color} mt-2`}>
                  {metric.value}%
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm Details */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                5단계 분석 프로세스
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              각 단계별 세부 알고리즘과 처리 과정을 자세히 살펴보세요
            </p>
          </div>

          <Tabs value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="text-sm">개요</TabsTrigger>
              {algorithmSteps.map((step, index) => (
                <TabsTrigger key={step.id} value={step.id} className="text-xs">
                  {index + 1}단계
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {algorithmSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="cursor-pointer animate-fade-in hover:scale-105 transition-transform"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedAlgorithm(step.id)}
                  >
                    <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6">
                    <BorderBeam delay={index * 0.2} />
                    
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardHeader className="pb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}>
                          <step.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            정확도 {step.accuracy}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                    </MagicCard>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/analyzer">
                  <ShimmerButton
                    className="px-8 py-4 text-lg font-medium"
                    shimmerColor="#ffffff40"
                    background="linear-gradient(45deg, rgb(59 130 246), rgb(147 51 234))"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    실제 분석 체험하기
                  </ShimmerButton>
                </Link>
              </div>
            </TabsContent>

            {algorithmSteps.map((step) => (
              <TabsContent key={step.id} value={step.id} className="space-y-8">
                <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8">
                  <BorderBeam />
                  
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="px-3 py-1">
                          <Activity className="mr-2 h-4 w-4" />
                          정확도 {step.accuracy}%
                        </Badge>
                        <div className="flex-1">
                          <Progress value={step.accuracy} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      세부 처리 과정
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.details.map((detail, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </MagicCard>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Analysis Example */}
      <section className="py-20 px-6 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                실제 분석 예시
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              프론트엔드 개발자 이력서와 채용공고의 매칭 분석 과정을 살펴보세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resume Example */}
            <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6">
              <BorderBeam delay={0} colorFrom="rgb(34 197 94)" colorTo="rgb(59 130 246)" />
              
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    이력서
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">제목</h4>
                    <p className="font-medium">{analysisExample.resume.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">주요 키워드</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisExample.resume.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">경력</h4>
                    <p className="text-sm">{analysisExample.resume.experience}</p>
                  </div>
                </CardContent>
              </Card>
            </MagicCard>

            {/* Job Posting Example */}
            <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6">
              <BorderBeam delay={0.5} colorFrom="rgb(168 85 247)" colorTo="rgb(249 115 22)" />
              
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-purple-600" />
                    채용공고
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">포지션</h4>
                    <p className="font-medium">{analysisExample.jobPosting.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">필수 요구사항</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisExample.jobPosting.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">경력 요구사항</h4>
                    <p className="text-sm">{analysisExample.jobPosting.experience}</p>
                  </div>
                </CardContent>
              </Card>
            </MagicCard>

            {/* Analysis Result */}
            <MagicCard className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6">
              <BorderBeam delay={1} colorFrom="rgb(59 130 246)" colorTo="rgb(34 197 94)" />
              
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    분석 결과
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <AnimatedCircularProgressBar
                      value={analysisExample.analysis.overall}
                      max={100}
                      className="w-16 h-16 mx-auto"
                      gaugePrimaryColor="rgb(34 197 94)"
                      gaugeSecondaryColor="rgb(229 231 235)"
                    />
                    <div className="text-sm text-muted-foreground mt-2">전체 매칭률</div>
                  </div>
                  
                  {[
                    { name: '키워드 매칭', value: analysisExample.analysis.keywordMatch },
                    { name: '스킬 매칭', value: analysisExample.analysis.skillMatch },
                    { name: '경력 매칭', value: analysisExample.analysis.experienceMatch },
                    { name: 'ATS 점수', value: analysisExample.analysis.atsScore }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </MagicCard>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                기술 스택 & 아키텍처
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              최신 웹 기술과 AI 라이브러리를 활용한 견고한 시스템 구조
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                category: 'Frontend',
                icon: Eye,
                technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'shadcn/ui', 'Magic UI'],
                color: 'from-blue-500 to-cyan-600'
              },
              {
                category: 'AI & ML',
                icon: Brain,
                technologies: ['Natural.js', 'TF-IDF', 'Word2Vec', 'PDF.js', 'Text Analytics', 'NLP'],
                color: 'from-purple-500 to-pink-600'
              },
              {
                category: 'Performance',
                icon: Zap,
                technologies: ['Service Worker', 'Code Splitting', 'Lazy Loading', 'Web Workers', 'PWA', 'Caching'],
                color: 'from-green-500 to-emerald-600'
              }
            ].map((tech, index) => (
              <MagicCard
                key={index}
                className="magic-card relative rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <BorderBeam delay={index * 0.3} />
                
                <Card className="border-0 bg-transparent shadow-none">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tech.color} flex items-center justify-center mb-4`}>
                      <tech.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{tech.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tech.technologies.map((item, techIndex) => (
                        <div key={techIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">
            지금 바로 체험해보세요
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            첨단 AI 기술로 정밀한 매칭 분석을 경험해보세요
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/analyzer">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-medium">
                <Sparkles className="mr-2 h-5 w-5" />
                분석 시작하기
              </Button>
            </Link>
            
            <Link to="/keyword-dictionary">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-medium">
                <Filter className="mr-2 h-5 w-5" />
                키워드 사전 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}