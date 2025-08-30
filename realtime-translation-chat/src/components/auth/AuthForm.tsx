import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userService } from '@/lib/services/userService'
import { mockUserService } from '@/lib/services/mockUserService'

// 개발 환경에서 오프라인 모드 사용
const authService = import.meta.env.VITE_API_MODE === 'offline' ? mockUserService : userService
import { SUPPORTED_LANGUAGES } from '@/lib/services/languageDetection'
import { Languages, Mail, Lock, User, Loader2, RefreshCw, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AuthForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    preferredLanguage: 'ko'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요'
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다'
    }

    // Password confirmation validation (only for sign up)
    if (isSignUp && !formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요'
    } else if (isSignUp && formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    }

    // Display name validation (only for sign up)
    if (isSignUp && !formData.displayName) {
      newErrors.displayName = '닉네임을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      if (isPasswordReset) {
        await authService.sendPasswordResetEmail(formData.email)
        setEmailSent(true)
        setSuccessMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.')
      } else if (isSignUp) {
        await authService.signUp(formData.email, formData.password, formData.displayName)
        // Update preferred language after signup
        await authService.updateUserProfile({
          preferredLanguage: formData.preferredLanguage
        })
        setSuccessMessage('회원가입이 완료되었습니다.')
        // 회원가입 성공 후 채팅 페이지로 이동
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/chat'
          navigate(from, { replace: true })
        }, 1000)
      } else {
        await authService.signIn(formData.email, formData.password)
        // 로그인 성공 후 즉시 채팅 페이지로 이동
        const from = location.state?.from?.pathname || '/chat'
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      
      // Handle Firebase auth errors
      let errorMessage = '인증에 실패했습니다'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다'
            break
          case 'auth/email-already-in-use':
            errorMessage = '이미 사용 중인 이메일입니다'
            break
          case 'auth/weak-password':
            errorMessage = '비밀번호가 너무 약합니다. 최소 6자 이상 입력해주세요'
            break
          case 'auth/invalid-email':
            errorMessage = '올바르지 않은 이메일 형식입니다'
            break
          case 'auth/too-many-requests':
            errorMessage = '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요'
            break
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결을 확인해주세요'
            break
          case 'auth/user-disabled':
            errorMessage = '비활성화된 계정입니다. 관리자에게 문의해주세요'
            break
          default:
            errorMessage = error.message || '인증에 실패했습니다'
        }
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnonymousLogin = async () => {
    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      console.log('🔄 Starting guest login...')
      
      // Try anonymous login first
      try {
        await authService.signInAnonymously()
        console.log('✅ Anonymous login successful, navigating to chat...')
      } catch (anonymousError: any) {
        console.log('⚠️ Anonymous login failed, trying test account fallback...')
        
        if (anonymousError.code === 'auth/admin-restricted-operation') {
          // Fallback to test account
          const testEmail = 'test@example.com'
          const testPassword = 'testpass123'
          const testName = 'Test Guest'
          
          try {
            await authService.signUp(testEmail, testPassword, testName)
            console.log('✅ Test account created successfully')
          } catch (signupError: any) {
            if (signupError.code === 'auth/email-already-in-use') {
              // Account exists, sign in
              await authService.signIn(testEmail, testPassword)
              console.log('✅ Test account signed in successfully')
            } else {
              throw signupError
            }
          }
        } else {
          throw anonymousError
        }
      }
      
      // 로그인 성공 후 즉시 채팅 페이지로 이동
      const from = location.state?.from?.pathname || '/chat'
      navigate(from, { replace: true })
    } catch (error: any) {
      console.error('❌ Guest login error:', error)
      let errorMessage = '게스트 로그인에 실패했습니다'
      
      if (error.code) {
        switch (error.code) {
          case 'auth/admin-restricted-operation':
            errorMessage = '익명 로그인이 비활성화되어 있습니다. Firebase 콘솔에서 활성화해주세요.'
            break
          case 'auth/operation-not-allowed':
            errorMessage = '이메일 인증이 비활성화되어 있습니다. Firebase 설정을 확인해주세요.'
            break
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결을 확인해주세요'
            break
          case 'auth/weak-password':
            errorMessage = '테스트 계정 생성 중 비밀번호 오류가 발생했습니다.'
            break
          default:
            errorMessage = error.message || '게스트 로그인에 실패했습니다'
        }
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setIsPasswordReset(false)
    setEmailSent(false)
    setErrors({})
    setSuccessMessage('')
    setFormData({
      email: '',
      password: '',
      passwordConfirm: '',
      displayName: '',
      preferredLanguage: 'ko'
    })
  }

  const togglePasswordReset = () => {
    setIsPasswordReset(!isPasswordReset)
    setIsSignUp(false)
    setEmailSent(false)
    setErrors({})
    setSuccessMessage('')
    if (isPasswordReset) {
      setFormData({
        email: '',
        password: '',
        passwordConfirm: '',
        displayName: '',
        preferredLanguage: 'ko'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isPasswordReset ? '비밀번호 재설정' : isSignUp ? '회원가입' : '로그인'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isPasswordReset 
              ? '비밀번호를 재설정하기 위해 이메일을 입력하세요'
              : `실시간 번역 채팅에 ${isSignUp ? '참여' : '로그인'}하세요`
            }
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.email && "border-destructive"
                  )}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            {!isPasswordReset && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn(
                      "pl-10",
                      errors.password && "border-destructive"
                    )}
                    placeholder="최소 6자 이상"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Password Confirmation (Sign up only) */}
            {isSignUp && !isPasswordReset && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                    className={cn(
                      "pl-10",
                      errors.passwordConfirm && "border-destructive"
                    )}
                    placeholder="비밀번호를 다시 입력해주세요"
                    disabled={isLoading}
                  />
                </div>
                {errors.passwordConfirm && (
                  <p className="text-sm text-destructive mt-1">{errors.passwordConfirm}</p>
                )}
              </div>
            )}

            {/* Display Name (Sign up only) */}
            {isSignUp && !isPasswordReset && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  닉네임
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={cn(
                      "pl-10",
                      errors.displayName && "border-destructive"
                    )}
                    placeholder="채팅에서 사용할 닉네임"
                    disabled={isLoading}
                    maxLength={20}
                  />
                </div>
                {errors.displayName && (
                  <p className="text-sm text-destructive mt-1">{errors.displayName}</p>
                )}
              </div>
            )}

            {/* Preferred Language (Sign up only) */}
            {isSignUp && !isPasswordReset && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  선호 언어
                </label>
                <div className="relative">
                  <Languages className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={isLoading}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (emailSent && isPasswordReset)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPasswordReset ? '이메일 발송 중...' : isSignUp ? '가입 중...' : '로그인 중...'}
                </>
              ) : emailSent && isPasswordReset ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  다시 발송하기
                </>
              ) : (
                isPasswordReset ? '비밀번호 재설정' : isSignUp ? '회원가입' : '로그인'
              )}
            </Button>

            {/* Anonymous Login Button - Show only on login mode */}
            {!isSignUp && !isPasswordReset && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">또는</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAnonymousLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      게스트 로그인 중...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      게스트로 시작하기
                    </>
                  )}
                </Button>
              </>
            )}
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <div className="w-full space-y-2">
            {!isPasswordReset ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
                </p>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    onClick={toggleMode}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isSignUp ? '로그인하기' : '회원가입하기'}
                  </Button>
                  {!isSignUp && (
                    <Button
                      variant="link"
                      onClick={togglePasswordReset}
                      disabled={isLoading}
                      className="text-xs text-muted-foreground"
                    >
                      비밀번호를 잊으셨나요?
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-1">
                <p className="text-sm text-muted-foreground">
                  비밀번호를 기억하셨나요?
                </p>
                <Button
                  variant="ghost"
                  onClick={togglePasswordReset}
                  disabled={isLoading}
                  className="w-full"
                >
                  로그인으로 돌아가기
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}