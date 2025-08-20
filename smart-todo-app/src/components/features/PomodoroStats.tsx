import { useMemo } from 'react'
import { Timer, Target, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { usePomodoroStore } from '@/stores'
import { formatDuration } from '@/utils'

interface PomodoroStatsProps {
  className?: string
}

export default function PomodoroStats({ className }: PomodoroStatsProps) {
  const { sessions, getSessionStats, getTodaySessions, getCompletedSessions } = usePomodoroStore()

  const stats = getSessionStats()
  const todaySessions = getTodaySessions()
  const completedSessions = getCompletedSessions()

  const weeklyStats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    
    const weekSessions = sessions.filter(session => 
      session.startTime >= weekStart && session.isCompleted
    )

    const workSessions = weekSessions.filter(s => s.type === 'work')
    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.duration, 0)
    
    return {
      totalSessions: weekSessions.length,
      workSessions: workSessions.length,
      totalWorkTime,
      averagePerDay: Math.round(workSessions.length / 7 * 10) / 10
    }
  }, [sessions])

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthSessions = sessions.filter(session => 
      session.startTime >= monthStart && session.isCompleted
    )

    const workSessions = monthSessions.filter(s => s.type === 'work')
    const totalWorkTime = workSessions.reduce((sum, s) => sum + s.duration, 0)
    
    return {
      totalSessions: monthSessions.length,
      workSessions: workSessions.length,
      totalWorkTime
    }
  }, [sessions])

  const todayWorkSessions = todaySessions.filter(s => s.type === 'work' && s.isCompleted)
  const todayWorkTime = todayWorkSessions.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 완료</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayWorkSessions.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatDuration(todayWorkTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 주</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.workSessions}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              일평균 {weeklyStats.averagePerDay}회
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 집중시간</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.totalTime / 60)}h
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.totalTime % 60}분
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 세션</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageTime)}분
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              총 {stats.completed}회 완료
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 세션</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSessions.slice(-5).reverse().map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.type === 'work' ? 'bg-blue-500' :
                      session.type === 'short-break' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.type === 'work' ? '작업' :
                         session.type === 'short-break' ? '짧은 휴식' : '긴 휴식'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.startTime.toLocaleTimeString('ko-KR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.duration}분
                  </div>
                </div>
              ))}
              
              {completedSessions.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  완료된 세션이 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주간 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">총 세션</span>
                <span className="font-semibold">{weeklyStats.totalSessions}회</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">작업 세션</span>
                <span className="font-semibold">{weeklyStats.workSessions}회</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">총 작업 시간</span>
                <span className="font-semibold">{formatDuration(weeklyStats.totalWorkTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">일평균 세션</span>
                <span className="font-semibold">{weeklyStats.averagePerDay}회</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  이번 달 통계
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">작업 세션</span>
                    <span className="text-sm font-medium">{monthlyStats.workSessions}회</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">총 작업 시간</span>
                    <span className="text-sm font-medium">{formatDuration(monthlyStats.totalWorkTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}