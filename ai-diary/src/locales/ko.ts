export const ko = {
  // 공통
  common: {
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "편집",
    back: "뒤로",
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    confirm: "확인",
    yes: "예",
    no: "아니오",
  },

  // 네비게이션
  nav: {
    home: "홈",
    write: "일기 쓰기",
    diary: "일기 목록",
    analytics: "분석",
    settings: "설정",
  },

  // 홈페이지
  home: {
    title: "AI 일기",
    subtitle: "감정 분석과 함께하는 스마트한 일기 서비스",
    todayMood: "오늘의 기분",
    recentEntries: "최근 일기",
    quickStats: "빠른 통계",
    totalEntries: "총 일기 수",
    averageEmotion: "평균 감정 점수",
    writeFirst: "첫 번째 일기를 작성해보세요!",
    noEntries: "아직 작성된 일기가 없습니다.",
  },

  // 일기 작성
  write: {
    title: "일기 작성",
    titlePlaceholder: "제목을 입력하세요",
    contentPlaceholder: "오늘 하루는 어떠셨나요? 자유롭게 작성해보세요...",
    analyzeEmotion: "감정 분석",
    analyzing: "분석 중...",
    preview: "미리보기",
    export: "내보내기",
    import: "가져오기",
    autoSaved: "자동 저장됨",
    saving: "저장 중...",
    characters: "자",
  },

  // 일기 목록
  diary: {
    title: "일기 목록",
    search: "일기 검색...",
    sortBy: "정렬",
    filterBy: "필터",
    noResults: "검색 결과가 없습니다.",
    sortOptions: {
      date: "날짜순",
      title: "제목순",
      emotion: "감정순",
    },
  },

  // 분석
  analytics: {
    title: "감정 분석",
    emotionTrend: "감정 변화",
    emotionDistribution: "감정 분포",
    weeklyTrend: "주간 추세",
    monthlyStats: "월간 통계",
  },

  // 설정
  settings: {
    title: "설정",
    general: "일반 설정",
    theme: "테마",
    language: "언어",
    autoSave: "자동 저장",
    autoSaveInterval: "자동 저장 간격",
    notifications: "알림",
    backup: "백업",
    backupSettings: "백업 설정",
    autoBackup: "자동 백업",
    backupInterval: "백업 간격",
    createBackup: "백업 생성",
    exportData: "데이터 내보내기",
    importData: "데이터 가져오기",
    dangerZone: "위험 영역",
    clearAllData: "모든 데이터 삭제",
    saveSettings: "설정 저장",
    
    themeOptions: {
      light: "밝은 테마",
      dark: "어두운 테마",
      auto: "시스템 설정",
    },
    
    languageOptions: {
      ko: "한국어",
      en: "English",
    },
    
    intervalOptions: {
      10000: "10초",
      30000: "30초",
      60000: "1분",
      300000: "5분",
    },
    
    backupIntervalOptions: {
      1: "매일",
      7: "매주",
      30: "매월",
    },
  },

  // 감정
  emotions: {
    happy: "행복",
    sad: "슬픔",
    angry: "화남",
    neutral: "보통",
    excited: "신남",
    calm: "평온",
    anxious: "불안",
    proud: "자랑스러움",
    disappointed: "실망",
    grateful: "감사",
  },

  // 메시지
  messages: {
    saveSuccess: "저장되었습니다.",
    saveError: "저장에 실패했습니다.",
    deleteConfirm: "정말로 삭제하시겠습니까?",
    deleteSuccess: "삭제되었습니다.",
    backupSuccess: "백업이 생성되었습니다.",
    backupError: "백업 생성에 실패했습니다.",
    emotionAnalysisComplete: "감정 분석이 완료되었습니다!",
    emotionAnalysisError: "감정 분석에 실패했습니다.",
    settingsSaved: "설정이 저장되었습니다.",
    dataCleared: "모든 데이터가 삭제되었습니다.",
    dataExported: "데이터가 내보내졌습니다.",
    dataImported: "데이터가 가져와졌습니다.",
  },
};