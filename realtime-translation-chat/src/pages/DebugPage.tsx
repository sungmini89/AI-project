import FirebaseDebug from '@/components/debug/FirebaseDebug'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Console</h1>
        <FirebaseDebug />
      </div>
    </div>
  )
}