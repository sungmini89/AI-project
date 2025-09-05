import React, { useState } from "react"
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Progress,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./index"

/**
 * shadcn/ui 컴포넌트 데모
 * 모든 컴포넌트가 올바르게 작동하는지 확인하기 위한 테스트 컴포넌트
 */
export function UIDemo() {
  const [progress, setProgress] = useState(33)
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui 컴포넌트 데모</CardTitle>
          <CardDescription>
            영수증 분할 계산기를 위한 UI 컴포넌트들이 올바르게 설치되었는지 확인하는 데모입니다.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tabs Demo */}
      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buttons">버튼 & 입력</TabsTrigger>
          <TabsTrigger value="progress">진행률</TabsTrigger>
          <TabsTrigger value="table">테이블</TabsTrigger>
          <TabsTrigger value="dialog">다이얼로그</TabsTrigger>
        </TabsList>

        {/* Buttons & Inputs Tab */}
        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>버튼 & 입력 컴포넌트</CardTitle>
              <CardDescription>
                다양한 버튼 스타일과 입력 필드 테스트
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>기본 버튼</Button>
                <Button variant="destructive">삭제 버튼</Button>
                <Button variant="outline">테두리 버튼</Button>
                <Button variant="secondary">보조 버튼</Button>
                <Button variant="ghost">투명 버튼</Button>
                <Button variant="link">링크 버튼</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">작은 버튼</Button>
                <Button size="default">기본 버튼</Button>
                <Button size="lg">큰 버튼</Button>
                <Button size="icon">🔄</Button>
              </div>
              <div className="space-y-2">
                <Input 
                  placeholder="금액을 입력하세요" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input type="number" placeholder="참가자 수" />
                <Input type="file" accept="image/*" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>진행률 컴포넌트</CardTitle>
              <CardDescription>
                OCR 처리 진행상황 표시용 컴포넌트
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>OCR 처리 진행률</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  disabled={progress === 0}
                >
                  -10%
                </Button>
                <Button 
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  disabled={progress === 100}
                >
                  +10%
                </Button>
                <Button onClick={() => setProgress(0)}>초기화</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Tab */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>테이블 컴포넌트</CardTitle>
              <CardDescription>
                분할 결과 표시용 테이블
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>영수증 분할 계산 결과</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">참가자</TableHead>
                    <TableHead>항목</TableHead>
                    <TableHead>수량</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">김철수</TableCell>
                    <TableCell>아메리카노</TableCell>
                    <TableCell>2개</TableCell>
                    <TableCell className="text-right">8,000원</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">이영희</TableCell>
                    <TableCell>카페라떼</TableCell>
                    <TableCell>1개</TableCell>
                    <TableCell className="text-right">5,000원</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">박민수</TableCell>
                    <TableCell>샌드위치</TableCell>
                    <TableCell>1개</TableCell>
                    <TableCell className="text-right">7,000원</TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>총합</TableCell>
                    <TableCell className="text-right">20,000원</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialog Tab */}
        <TabsContent value="dialog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>다이얼로그 컴포넌트</CardTitle>
              <CardDescription>
                설정 및 확인 모달창
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>설정 열기</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>영수증 처리 설정</DialogTitle>
                    <DialogDescription>
                      OCR 인식 정확도와 처리 옵션을 설정할 수 있습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="accuracy" className="text-right">
                        인식 정확도
                      </label>
                      <Input
                        id="accuracy"
                        type="range"
                        min="1"
                        max="10"
                        defaultValue="8"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="language" className="text-right">
                        언어
                      </label>
                      <select className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="kor">한국어</option>
                        <option value="eng">English</option>
                        <option value="jpn">日本語</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">설정 저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                모든 컴포넌트가 성공적으로 설치되었습니다! 🎉
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}