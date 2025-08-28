
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BookOpen, 
  Brain, 
  Upload, 
  BarChart3,
  Zap,
  Target,
  Clock,
  Award
} from 'lucide-react';

// 홈페이지 컴포넌트
export default function HomePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 히어로 섹션 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          AI Study Helper
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI 기반 학습 도우미로 더 똑똑하게 공부하세요. 
          플래시카드 자동 생성부터 간격 반복 학습까지, 모든 것이 자동화됩니다.
        </p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link to="/upload">
            <Button size="lg" variant="outline" className="px-8">
              학습 시작하기
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="px-8">
              대시보드 보기
            </Button>
          </Link>
        </div>
      </div>

      {/* 주요 기능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link to="/upload">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Upload className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>자료 업로드</CardTitle>
              <CardDescription>
                텍스트나 PDF 파일을 업로드하여 AI가 자동으로 분석하고 학습 자료로 변환합니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/flashcards">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>플래시카드</CardTitle>
              <CardDescription>
                업로드한 자료를 바탕으로 자동 생성된 플래시카드로 효율적인 학습을 진행하세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/quiz">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Brain className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>퀴즈</CardTitle>
              <CardDescription>
                다양한 유형의 퀴즈로 학습한 내용을 점검하고 약점을 파악할 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/dashboard">
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>학습 분석</CardTitle>
              <CardDescription>
                학습 진도와 성과를 시각화하여 체계적인 학습 계획을 세울 수 있습니다.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* 특징 섹션 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">왜 AI Study Helper일까요?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-4" />
            <h3 className="font-semibold mb-2">자동화된 학습</h3>
            <p className="text-sm text-gray-600">
              AI가 자동으로 핵심 내용을 추출하고 최적의 학습 자료를 생성합니다.
            </p>
          </Card>

          <Card className="text-center p-6">
            <Target className="w-8 h-8 mx-auto text-red-500 mb-4" />
            <h3 className="font-semibold mb-2">개인 맞춤형</h3>
            <p className="text-sm text-gray-600">
              개인의 학습 패턴을 분석하여 맞춤형 복습 스케줄을 제공합니다.
            </p>
          </Card>

          <Card className="text-center p-6">
            <Clock className="w-8 h-8 mx-auto text-blue-500 mb-4" />
            <h3 className="font-semibold mb-2">간격 반복 학습</h3>
            <p className="text-sm text-gray-600">
              과학적으로 입증된 SM-2 알고리즘으로 장기 기억을 강화합니다.
            </p>
          </Card>

          <Card className="text-center p-6">
            <Award className="w-8 h-8 mx-auto text-green-500 mb-4" />
            <h3 className="font-semibold mb-2">성과 추적</h3>
            <p className="text-sm text-gray-600">
              학습 진도와 성취도를 실시간으로 추적하고 분석합니다.
            </p>
          </Card>
        </div>
      </div>

      {/* 시작하기 섹션 */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작해보세요!</h2>
          <p className="text-xl mb-6 opacity-90">
            몇 분만에 설정을 완료하고 스마트한 학습을 시작할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/upload">
              <Button size="lg" variant="secondary">
                첫 자료 업로드하기
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-blue-900 bg-white border-blue-200 hover:bg-blue-50">
                둘러보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 통계 섹션 */}
      <div className="mt-12 text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600">오프라인 지원</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">3초</div>
            <div className="text-sm text-gray-600">평균 카드 생성 시간</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">85%</div>
            <div className="text-sm text-gray-600">평균 기억 향상률</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">무료</div>
            <div className="text-sm text-gray-600">모든 핵심 기능</div>
          </div>
        </div>
      </div>
    </div>
  );
}