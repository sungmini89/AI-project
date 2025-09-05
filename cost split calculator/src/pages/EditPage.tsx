import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShinyButton } from '@/components/magicui/shiny-button'
import { BillItem } from '@/types'

const EditPage = () => {
  const navigate = useNavigate()
  const [billItems, setBillItems] = useState<BillItem[]>([
    { id: '1', name: '커피', price: 4500, quantity: 2, category: '음료' },
    { id: '2', name: '샌드위치', price: 7800, quantity: 1, category: '음식' },
    { id: '3', name: '케이크', price: 5200, quantity: 1, category: '디저트' }
  ])
  const [isEditing, setIsEditing] = useState<string | null>(null)

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setBillItems(billItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: '새 항목',
      price: 0,
      quantity: 1,
      category: '기타'
    }
    setBillItems([...billItems, newItem])
  }

  const removeItem = (id: string) => {
    setBillItems(billItems.filter(item => item.id !== id))
  }

  const saveChanges = () => {
    console.log('Saving changes...', billItems)
    setIsEditing(null)
  }

  const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="container mx-auto p-4 max-w-4xl" data-testid="edit-page">
      <Card>
        <CardHeader>
          <CardTitle data-testid="edit-title">OCR 결과 편집</CardTitle>
          <p className="text-muted-foreground">
            OCR로 추출된 영수증 항목들을 확인하고 수정하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* OCR 이미지 미리보기 */}
            <div data-testid="ocr-preview" className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">원본 영수증 이미지</p>
              <div className="w-32 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">이미지 미리보기</span>
              </div>
            </div>

            {/* 항목 목록 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">추출된 항목들</h3>
                <Button 
                  data-testid="add-item-button"
                  onClick={addItem}
                  variant="outline"
                  size="sm"
                >
                  + 항목 추가
                </Button>
              </div>
              
              {billItems.map((item, index) => (
                <Card key={item.id} data-testid={`editable-item-${index}`} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <Label>상품명</Label>
                      {isEditing === item.id ? (
                        <Input
                          data-testid={`item-name-input-${index}`}
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      ) : (
                        <p className="font-medium cursor-pointer hover:text-primary" onClick={() => setIsEditing(item.id)} data-testid={`edit-item-name-${index}`}>
                          {item.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>가격</Label>
                      {isEditing === item.id ? (
                        <Input
                          data-testid={`item-price-input-${index}`}
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <p className="cursor-pointer hover:text-primary" onClick={() => setIsEditing(item.id)} data-testid={`edit-item-price-${index}`}>
                          {item.price.toLocaleString()}원
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label>수량</Label>
                      {isEditing === item.id ? (
                        <Input
                          data-testid={`item-quantity-${index}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      ) : (
                        <p className="cursor-pointer hover:text-primary" onClick={() => setIsEditing(item.id)} data-testid={`edit-item-quantity-${index}`}>
                          {item.quantity}개
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <Button
                        data-testid={`remove-item-${index}`}
                        onClick={() => removeItem(item.id)}
                        variant="destructive"
                        size="sm"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                  
                  {isEditing === item.id && (
                    <div className="mt-4 flex space-x-2">
                      <Button
                        data-testid={`save-item-${index}`}
                        onClick={() => setIsEditing(null)}
                        size="sm"
                      >
                        완료
                      </Button>
                      <Button
                        data-testid={`cancel-edit-${index}`}
                        onClick={() => setIsEditing(null)}
                        variant="outline"
                        size="sm"
                      >
                        취소
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 총액 표시 */}
            <Card className="p-4 bg-primary/5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총 금액</span>
                <span data-testid="edit-total-amount" className="text-xl font-bold">
                  {total.toLocaleString()}원
                </span>
              </div>
            </Card>

            {/* 저장 버튼들 */}
            <div className="flex space-x-4">
              <ShinyButton
                data-testid="save-changes-button"
                onClick={saveChanges}
                className="flex-1"
              >
                변경사항 저장
              </ShinyButton>
              <Button
                data-testid="cancel-edit-button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                취소
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditPage