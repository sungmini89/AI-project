import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, User as UserIcon, Globe, Shield, LogOut, Loader2 } from 'lucide-react'
import { userService } from '@/lib/services/userService'
import { SUPPORTED_LANGUAGES, getLanguageName } from '@/lib/constants/languages'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import type { ChatUser } from '@/types'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [user] = useAuthState(auth)
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load current user data
  useEffect(() => {
    if (user) {
      const userData = userService.getCurrentUser()
      if (userData) {
        setCurrentUser(userData)
        setDisplayName(userData.displayName)
        setPreferredLanguage(userData.preferredLanguage)
      }
    }
  }, [user])

  const handleSaveSettings = async () => {
    if (!user || !currentUser) return

    setIsSaving(true)
    try {
      await userService.updateUserProfile({
        displayName: displayName.trim(),
        preferredLanguage
      })

      // Update local state
      setCurrentUser(prev => prev ? {
        ...prev,
        displayName: displayName.trim(),
        preferredLanguage
      } : null)

      alert('설정이 성공적으로 저장되었습니다!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    const confirm = window.confirm('정말 로그아웃하시겠습니까?')
    if (!confirm) return

    try {
      await userService.signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
      alert('로그아웃에 실패했습니다.')
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (!user || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">설정</h1>
              <p className="text-muted-foreground">계정 및 언어 설정을 관리하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <div className="flex items-center space-x-4">
              <UserIcon className="h-5 w-5" />
              <div>
                <CardTitle>프로필</CardTitle>
                <CardDescription>
                  표시 이름과 기본 정보를 관리하세요
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.photoURL || undefined} />
                <AvatarFallback className="text-lg">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email">이메일 주소</Label>
                    <Input 
                      id="email"
                      value={user.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">표시 이름</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="표시될 이름을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <div className="flex items-center space-x-4">
              <Globe className="h-5 w-5" />
              <div>
                <CardTitle>언어 설정</CardTitle>
                <CardDescription>
                  기본 언어를 설정하면 메시지를 해당 언어로 번역해서 보여줍니다
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">기본 언어</Label>
              <Select 
                value={preferredLanguage} 
                onValueChange={setPreferredLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="언어를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        {lang.native} ({lang.name})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                현재 선택된 언어: <strong>{getLanguageName(preferredLanguage)}</strong>
              </p>
            </div>

            <Separator />

            {/* Supported Languages Display */}
            <div>
              <Label>지원되는 언어</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <Badge 
                    key={lang.code} 
                    variant={lang.code === preferredLanguage ? "default" : "outline"}
                    className="text-xs"
                  >
                    {lang.native}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                총 {SUPPORTED_LANGUAGES.length}개 언어가 지원됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>계정 상태</CardTitle>
                <CardDescription>
                  현재 계정의 상태와 정보입니다
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>현재 상태</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">온라인</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>이메일 인증</Label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">{user.emailVerified ? '인증됨' : '미인증'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSaveSettings}
            disabled={isSaving || !displayName.trim()}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                설정 저장
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* Footer Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                설정 변경사항은 모든 디바이스에서 자동으로 동기화됩니다.
              </p>
              <p className="text-xs text-muted-foreground">
                계정 ID: <code className="bg-muted px-1 rounded">{user.uid.slice(0, 8)}...</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}