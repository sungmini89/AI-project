import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Edit, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Template {
  id: string
  name: string
  participants: number
  splitType: string
  usageCount: number
}

export const TemplatesPage = () => {
  const navigate = useNavigate()
  
  // localStorage에서 템플릿 데이터 불러오기
  const loadTemplatesFromStorage = (): Template[] => {
    try {
      const savedTemplates = localStorage.getItem('costSplitTemplates')
      if (savedTemplates) {
        return JSON.parse(savedTemplates)
      }
    } catch (error) {
      console.error('템플릿 데이터 로딩 실패:', error)
    }
    
    // 기본 템플릿 데이터 반환
    return [
      { id: '1', name: '회식 템플릿', participants: 4, splitType: '균등 분할', usageCount: 12 },
      { id: '2', name: '카페 모임', participants: 3, splitType: '항목별 분할', usageCount: 8 },
      { id: '3', name: '데이트', participants: 2, splitType: '7:3 비율', usageCount: 5 }
    ]
  }

  const [templates, setTemplates] = useState<Template[]>(loadTemplatesFromStorage)
  
  // localStorage에 템플릿 데이터 저장
  const saveTemplatesToStorage = (templatesData: Template[]) => {
    try {
      localStorage.setItem('costSplitTemplates', JSON.stringify(templatesData))
    } catch (error) {
      console.error('템플릿 데이터 저장 실패:', error)
    }
  }

  // templates 상태가 변경될 때마다 localStorage에 저장
  React.useEffect(() => {
    saveTemplatesToStorage(templates)
  }, [templates])
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    participants: 2,
    splitType: '균등 분할'
  })

  const splitTypeOptions = [
    '균등 분할',
    '항목별 분할', 
    '7:3 비율',
    '6:4 비율',
    '사용자 정의'
  ]

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setEditForm({
      name: '',
      participants: 2,
      splitType: '균등 분할'
    })
    setIsEditModalOpen(true)
  }

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // 사용 횟수 증가
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
      ))
      alert(`"${template.name}" 템플릿을 사용하여 계산기 페이지로 이동합니다.`)
      navigate('/calculator')
    }
  }

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEditingTemplate(template)
      setEditForm({
        name: template.name,
        participants: template.participants,
        splitType: template.splitType
      })
      setIsEditModalOpen(true)
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template && window.confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      alert('템플릿이 삭제되어 저장되었습니다.')
    }
  }

  const handleSaveTemplate = () => {
    if (!editForm.name.trim()) {
      alert('템플릿 이름을 입력해주세요.')
      return
    }

    if (editingTemplate) {
      // 기존 템플릿 편집
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, name: editForm.name, participants: editForm.participants, splitType: editForm.splitType }
          : t
      ))
      alert('템플릿이 수정되어 저장되었습니다!')
    } else {
      // 새 템플릿 생성
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: editForm.name,
        participants: editForm.participants,
        splitType: editForm.splitType,
        usageCount: 0
      }
      setTemplates(prev => [...prev, newTemplate])
      alert('새 템플릿이 생성되어 저장되었습니다!')
    }

    setIsEditModalOpen(false)
    setEditingTemplate(null)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="templates-page">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tech-title mb-2">분할 템플릿</h1>
            <p className="text-muted-foreground tech-subtitle">자주 사용하는 분할 설정을 저장하고 재사용하세요</p>
          </div>
          <Button 
            variant="industrial" 
            className="flex items-center space-x-2"
            onClick={handleCreateTemplate}
          >
            <Plus className="h-4 w-4" />
            <span>새 템플릿</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="steel-panel hud-element">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary glow-orange" />
                    <CardTitle className="text-base tech-title">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1" 
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-1" 
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="tech-display rounded p-3 space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">참가자:</span> {template.participants}명
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">분할 방식:</span> {template.splitType}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">사용 횟수:</span> {template.usageCount}번
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  템플릿 사용
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 편집/생성 모달 */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background steel-panel p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tech-title">
                  {editingTemplate ? '템플릿 편집' : '새 템플릿 생성'}
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">템플릿 이름</Label>
                  <Input
                    id="templateName"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="예: 회식 템플릿"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="participants">참가자 수</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="2"
                    max="20"
                    value={editForm.participants}
                    onChange={(e) => setEditForm(prev => ({ ...prev, participants: parseInt(e.target.value) || 2 }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="splitType">분할 방식</Label>
                  <select
                    id="splitType"
                    value={editForm.splitType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, splitType: e.target.value }))}
                    className="mt-1 w-full p-2 border border-input bg-background rounded-md"
                  >
                    {splitTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  variant="industrial"
                  onClick={handleSaveTemplate}
                  className="flex-1"
                >
                  {editingTemplate ? '수정' : '생성'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="steel-panel">
          <CardHeader>
            <CardTitle className="tech-title">템플릿 생성 가이드</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="tech-display rounded p-4">
              <h3 className="text-sm font-medium mb-3">템플릿 활용 팁</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>자주 만나는 그룹별로 템플릿을 만들어 두세요</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>분할 비율이 정해진 경우 미리 설정해 두면 편리합니다</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>템플릿 이름은 구분하기 쉽게 명확하게 작성하세요</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>템플릿은 브라우저에 자동 저장되어 새로고침해도 유지됩니다</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TemplatesPage