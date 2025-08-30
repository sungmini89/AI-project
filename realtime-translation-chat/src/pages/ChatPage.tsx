import { lazy, Suspense } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'

// Lazy load the ChatInterface component for better performance
const ChatInterface = lazy(() => import('@/components/chat/ChatInterface'))

export default function ChatPage() {
  const [user] = useAuthState(auth)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ChatInterface user={user} />
    </Suspense>
  )
}