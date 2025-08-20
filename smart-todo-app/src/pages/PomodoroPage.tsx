import { useState } from 'react'
import { Timer, BarChart3, List } from 'lucide-react'
import { Button } from '@/components/ui'
import { PomodoroTimer, PomodoroStats, TaskCard } from '@/components/features'
import { useTaskStore } from '@/stores'
import { cn } from '@/utils'

type ViewMode = 'timer' | 'stats' | 'tasks'

export default function PomodoroPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timer')
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>()
  const { tasks } = useTaskStore()

  const activeTasks = tasks.filter(task => 
    task.status !== 'done' && 
    (task.dueDate === undefined || task.dueDate >= new Date())
  ).sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            포모도로 타이머
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            집중력을 높이고 생산성을 향상시키세요
          </p>
        </div>

        <div className="flex rounded-md border border-gray-200 dark:border-gray-700">
          <Button
            variant={viewMode === 'timer' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timer')}
            className="rounded-r-none"
          >
            <Timer className="w-4 h-4 mr-2" />
            타이머
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('stats')}
            className="rounded-none"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            통계
          </Button>
          <Button
            variant={viewMode === 'tasks' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tasks')}
            className="rounded-l-none"
          >
            <List className="w-4 h-4 mr-2" />
            할일
          </Button>
        </div>
      </div>

      {viewMode === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PomodoroTimer taskId={selectedTaskId} />
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                작업할 할일 선택
              </h3>
              
              {selectedTask && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        선택된 할일
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        {selectedTask.title}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTaskId(undefined)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      선택 해제
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-colors',
                      selectedTaskId === task.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                            task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {task.priority}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeTasks.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    활성 할일이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'stats' && (
        <PomodoroStats />
      )}

      {viewMode === 'tasks' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              활성 할일 목록
            </h3>
            
            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <TaskCard key={task.id} task={task} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Timer className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  활성 할일이 없습니다
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  새로운 할일을 추가하여 포모도로 타이머를 시작하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}