import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Globe, Users, Zap, Shield, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

export default function LandingPage() {
  const [user] = useAuthState(auth)

  const features = [
    {
      icon: Globe,
      title: '실시간 번역',
      description: '14개 언어로 실시간 번역하여 전 세계 사람들과 소통하세요'
    },
    {
      icon: MessageCircle,
      title: '즉시 채팅',
      description: '번역 지연 없이 자연스럽게 대화할 수 있습니다'
    },
    {
      icon: Users,
      title: '다중 사용자',
      description: '여러 사용자가 각자의 언어로 동시에 채팅 가능합니다'
    },
    {
      icon: Zap,
      title: '빠른 성능',
      description: '최적화된 번역 엔진으로 빠른 응답 속도를 제공합니다'
    },
    {
      icon: Shield,
      title: '안전한 채팅',
      description: 'Firebase 인증으로 안전하게 보호되는 채팅방입니다'
    },
    {
      icon: Smartphone,
      title: '반응형 디자인',
      description: '모바일, 태블릿, 데스크톱에서 모두 완벽하게 작동합니다'
    }
  ]

  const supportedLanguages = [
    '한국어', 'English', '日本語', '中文', 'Español', 'Français', 
    'Deutsch', 'Italiano', 'Português', 'Русский', 'العربية', 
    'हिन्दी', 'ไทย', 'Tiếng Việt'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              🌍 전 세계와 소통하세요
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              실시간 번역 채팅
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              언어의 벽을 넘어 전 세계 사람들과 자유롭게 소통하세요. 
              14개 언어로 실시간 번역되는 혁신적인 채팅 플랫폼입니다.
            </p>
            
            <div className="flex justify-center items-center mb-12">
              {user ? (
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/chat">채팅 시작하기</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="text-lg px-8 py-3">
                  <Link to="/auth">무료로 시작하기</Link>
                </Button>
              )}
            </div>
            
            {/* Language Tags */}
            <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
              {supportedLanguages.map((lang, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              왜 실시간 번역 채팅인가요?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              언어 장벽 없이 전 세계 사람들과 소통할 수 있는 최고의 방법을 제공합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              간단한 3단계로 전 세계와 소통을 시작하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">계정 생성</h3>
              <p className="text-gray-600 dark:text-gray-300">
                이메일로 간단히 가입하고 선호하는 언어를 설정하세요.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">채팅방 참여</h3>
              <p className="text-gray-600 dark:text-gray-300">
                기존 채팅방에 참여하거나 새로운 채팅방을 만들어보세요.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">소통 시작</h3>
              <p className="text-gray-600 dark:text-gray-300">
                자신의 언어로 메시지를 보내면 자동으로 다른 언어로 번역됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 시작해보세요!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            전 세계 사람들과 언어 장벽 없이 소통하는 새로운 경험을 만나보세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                <Link to="/chat">채팅 시작하기</Link>
              </Button>
            ) : (
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-3"
              >
                <Link to="/auth">무료로 시작하기</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              실시간 번역 채팅
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              언어의 벽을 넘어 전 세계와 소통하세요
            </p>
            <div className="flex justify-center space-x-4">
              {user && (
                <Button variant="ghost" asChild>
                  <Link to="/settings">설정</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}