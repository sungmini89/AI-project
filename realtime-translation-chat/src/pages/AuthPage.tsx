import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  const [user] = useAuthState(auth)
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/chat'

  useEffect(() => {
    if (user) {
      // User is authenticated, redirect to intended destination or chat
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  if (user) {
    // Show loading state while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthForm />
    </div>
  )
}