// Mock UserService for offline development
export class MockUserService {
  private mockUser = {
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    preferredLanguage: 'ko'
  }

  // 현재 인증된 사용자 상태 저장
  private currentUser: any = null
  
  // 인증 상태 변화 리스너들
  private authStateListeners: ((user: any) => void)[] = []

  setupOfflineDetection() {
    console.log('Mock offline detection setup')
  }

  async signUp(email: string, _password: string, displayName: string): Promise<any> {
    console.log('Mock SignUp:', { email, displayName })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = {
      ...this.mockUser,
      email,
      displayName,
      uid: `mock-${Date.now()}`
    }
    
    // 현재 사용자 저장 및 Firebase auth state 업데이트
    this.currentUser = user
    this.updateAuthState(user)
    
    return { user }
  }

  async signIn(email: string, _password: string): Promise<any> {
    console.log('Mock SignIn:', { email })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = {
      ...this.mockUser,
      email
    }
    
    // 현재 사용자 저장 및 Firebase auth state 업데이트
    this.currentUser = user
    this.updateAuthState(user)
    
    return { user }
  }

  async signOut(): Promise<void> {
    console.log('Mock SignOut')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 사용자 로그아웃 및 Firebase auth state 업데이트
    this.currentUser = null
    this.updateAuthState(null)
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    console.log('Mock Password Reset:', { email })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  async updateUserProfile(updates: any): Promise<void> {
    console.log('Mock Profile Update:', updates)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // 인증 상태 변화 리스너 등록 (Firebase onAuthStateChanged 모킹)
  onAuthStateChanged(callback: (user: any) => void) {
    // 리스너 등록
    this.authStateListeners.push(callback)
    
    // 현재 상태를 즉시 전달
    callback(this.currentUser)
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Firebase auth state를 모킹하기 위한 헬퍼 메서드
  private updateAuthState(user: any) {
    this.currentUser = user
    
    // 모든 리스너에게 상태 변화 알림
    this.authStateListeners.forEach(callback => {
      callback(user)
    })
    
    console.log('Mock Auth State Updated:', user ? user.email : 'signed out')
  }
}

export const mockUserService = new MockUserService()