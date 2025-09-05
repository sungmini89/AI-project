import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react'
import { statsService, type StatsData } from '@/services/statsService'

export const StatsPage = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const statsData = await statsService.calculateStats()
      setStats(statsData)
    } catch (error) {
      console.error('통계 로딩 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number): string => {
    return `₩${amount.toLocaleString()}`
  }

  const formatChange = (change: number): string => {
    if (change === 0) return '변동없음'
    const sign = change > 0 ? '+' : ''
    return `지난달 대비 ${sign}${change.toFixed(1)}%`
  }

  const getTopCategories = () => {
    if (!stats || Object.keys(stats.categories).length === 0) {
      return [
        { name: '데이터 없음', percentage: 0, amount: 0 }
      ]
    }

    return Object.entries(stats.categories)
      .sort(([,a], [,b]) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(([name, data]) => ({
        name,
        percentage: data.percentage,
        amount: data.amount
      }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl" data-testid="stats-page">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tech-title mb-2">지출 패턴 분석</h1>
            <p className="text-muted-foreground tech-subtitle">아카이브된 계산 내역을 기반으로 한 통계</p>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">통계 데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="stats-page">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tech-title mb-2">지출 패턴 분석</h1>
          <p className="text-muted-foreground tech-subtitle">아카이브된 계산 내역을 기반으로 한 통계</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="steel-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tech-subtitle">총 계산 횟수</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.totalCalculations || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats ? formatChange(stats.changes.calculationsChange) : '데이터 없음'}
              </p>
            </CardContent>
          </Card>

          <Card className="steel-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tech-subtitle">평균 지출</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats ? formatAmount(Math.round(stats.averageAmount)) : '₩0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats ? formatChange(stats.changes.amountChange) : '데이터 없음'}
              </p>
            </CardContent>
          </Card>

          <Card className="steel-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tech-subtitle">총 지출액</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats ? formatAmount(stats.totalAmount) : '₩0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats ? formatChange(stats.changes.amountChange) : '데이터 없음'}
              </p>
            </CardContent>
          </Card>

          <Card className="steel-panel">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium tech-subtitle">카테고리</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats ? Object.keys(stats.categories).length : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats && Object.keys(stats.categories).length > 0
                  ? Object.keys(stats.categories).slice(0, 2).join(', ') + ' 등'
                  : '데이터 없음'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="steel-panel hud-element">
            <CardHeader>
              <CardTitle className="tech-title">월별 지출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="tech-display rounded-lg p-4">
                {stats && stats.monthlyTrend.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">최근 6개월 추이</p>
                    {stats.monthlyTrend.slice(-6).map((monthData, index) => (
                      <div key={monthData.month} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{monthData.month}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-muted/30 rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full transition-all" 
                                style={{ 
                                  width: `${Math.max(5, (monthData.amount / (stats.totalAmount || 1)) * 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {monthData.calculations}건
                            </span>
                          </div>
                          <span className="text-sm font-medium w-20 text-right">
                            {formatAmount(monthData.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      아카이브된 데이터가 없습니다.<br />
                      완료된 계산을 아카이브에 보관해보세요.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="steel-panel hud-element">
            <CardHeader>
              <CardTitle className="tech-title">카테고리별 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="tech-display rounded-lg p-4">
                {stats && Object.keys(stats.categories).length > 0 ? (
                  <div className="space-y-3">
                    {getTopCategories().map((category, index) => (
                      <div key={category.name} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatAmount(category.amount)})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-muted/30 rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full transition-all" 
                              style={{ width: `${Math.max(5, category.percentage)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      아카이브된 데이터가 없습니다.<br />
                      완료된 계산을 아카이브에 보관해보세요.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="steel-panel">
            <CardHeader>
              <CardTitle className="tech-title">통계 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="tech-display rounded p-4">
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">데이터 소스:</span> 아카이브에 보관된 완료 계산만 통계에 포함됩니다</p>
                  <p><span className="text-muted-foreground">자동 아카이브:</span> 완료된 계산은 90일 후 자동으로 아카이브됩니다</p>
                  <p><span className="text-muted-foreground">수동 아카이브:</span> 히스토리 페이지에서 완료된 계산을 직접 아카이브할 수 있습니다</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StatsPage