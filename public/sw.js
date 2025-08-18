// AI 코드 리뷰어 서비스 워커
// PWA 오프라인 지원 및 캐싱 관리

const CACHE_NAME = 'ai-code-review-v1.0.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;

// 캐시할 정적 파일들
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline',
  '/analyze',
  '/settings',
  '/manifest.json',
  // Vite 빌드 결과물들은 런타임에 추가됩니다
];

// 캐시하지 않을 URL 패턴
const EXCLUDE_URLS = [
  /^https:\/\/api\.cohere\.ai/,
  /^https:\/\/generativelanguage\.googleapis\.com/,
  /^https:\/\/api-inference\.huggingface\.co/,
  /\/sw\.js$/,
  /\/workbox-/,
];

// 오프라인 페이지 HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>오프라인 - AI 코드 리뷰어</title>
    <style>
        body {
            margin: 0;
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
        p { margin: 0 0 2rem 0; opacity: 0.9; line-height: 1.6; }
        .button {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.2s;
        }
        .button:hover { background: rgba(255, 255, 255, 0.3); }
        .features {
            margin-top: 2rem;
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: 0.5rem;
        }
        .features h3 { margin: 0 0 1rem 0; font-size: 1rem; }
        .features ul { margin: 0; padding-left: 1.5rem; }
        .features li { margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>오프라인 모드</h1>
        <p>
            인터넷 연결이 없어도 AI 코드 리뷰어의 
            기본 기능들을 계속 사용할 수 있습니다.
        </p>
        
        <a href="/offline" class="button">오프라인 도구 사용하기</a>
        
        <div class="features">
            <h3>🔧 오프라인에서 사용 가능한 기능:</h3>
            <ul>
                <li>ESLint 기반 코드 품질 검사</li>
                <li>McCabe 복잡도 분석</li>
                <li>보안 패턴 검사</li>
                <li>Prettier 코드 포맷팅</li>
                <li>코드 히스토리 관리</li>
            </ul>
        </div>
    </div>
</body>
</html>
`;

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  console.log('[SW] 서비스 워커 설치 중...');
  
  event.waitUntil(
    Promise.all([
      // 정적 파일 캐시
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] 정적 파일 캐싱 중...');
        return cache.addAll(STATIC_FILES);
      }),
      
      // 오프라인 페이지 캐시
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.put('/offline.html', new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ]).then(() => {
      console.log('[SW] 설치 완료');
      return self.skipWaiting();
    })
  );
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] 서비스 워커 활성화 중...');
  
  event.waitUntil(
    Promise.all([
      // 이전 캐시 정리
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('ai-code-review-') && 
              !cacheName.startsWith(CACHE_NAME)
            )
            .map(cacheName => {
              console.log('[SW] 이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // 모든 클라이언트에서 새 서비스 워커 활성화
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] 활성화 완료');
    })
  );
});

// Fetch 이벤트 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 캐시하지 않을 URL 제외
  if (EXCLUDE_URLS.some(pattern => pattern.test(request.url))) {
    return fetch(request);
  }
  
  // GET 요청만 캐시
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

// 요청 처리 함수
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 네비게이션 요청 (페이지 이동)
    if (request.mode === 'navigate') {
      return handleNavigateRequest(request);
    }
    
    // 정적 리소스 요청
    if (isStaticAsset(url.pathname)) {
      return handleStaticRequest(request);
    }
    
    // API 요청
    if (isAPIRequest(url)) {
      return handleAPIRequest(request);
    }
    
    // 기타 요청
    return handleOtherRequest(request);
    
  } catch (error) {
    console.error('[SW] 요청 처리 오류:', error);
    return handleOfflineResponse(request);
  }
}

// 네비게이션 요청 처리 (SPA 라우팅)
async function handleNavigateRequest(request) {
  try {
    // 네트워크 우선 시도
    const response = await fetch(request);
    
    if (response.ok) {
      // 성공한 응답을 캐시에 저장
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    // 오프라인이거나 네트워크 오류인 경우
    console.log('[SW] 네트워크 오류, 캐시에서 응답:', request.url);
    
    // 캐시에서 index.html 반환 (SPA 지원)
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시도 없으면 오프라인 페이지 반환
    return caches.match('/offline.html');
  }
}

// 정적 리소스 요청 처리
async function handleStaticRequest(request) {
  // 캐시 우선 전략
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // 백그라운드에서 업데이트 확인
    fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE_NAME);
        cache.put(request, response);
      }
    }).catch(() => {}); // 백그라운드 업데이트 실패는 무시
    
    return cachedResponse;
  }
  
  // 캐시에 없으면 네트워크에서 가져와서 캐시
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    // 오프라인인 경우 대체 응답
    return new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// API 요청 처리
async function handleAPIRequest(request) {
  try {
    // API 요청은 항상 네트워크 우선
    const response = await fetch(request);
    
    // 성공한 응답은 동적 캐시에 저장 (짧은 시간)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
    
  } catch (error) {
    // 오프라인인 경우 캐시에서 찾아보기
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // API 오프라인 응답
    return new Response(JSON.stringify({
      error: 'offline',
      message: '오프라인 상태입니다. 기본 분석 기능을 사용해주세요.',
      fallback: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 기타 요청 처리
async function handleOtherRequest(request) {
  // 네트워크 우선 시도
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // 캐시에서 찾기
    return caches.match(request);
  }
}

// 오프라인 응답 처리
async function handleOfflineResponse(request) {
  if (request.mode === 'navigate') {
    return caches.match('/offline.html');
  }
  
  return new Response('오프라인 상태입니다.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// 유틸리티 함수들
function isStaticAsset(pathname) {
  return /\\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|ico)$/i.test(pathname);
}

function isAPIRequest(url) {
  return url.hostname !== location.hostname || 
         url.pathname.startsWith('/api/');
}

// 백그라운드 동기화 (미래 확장용)
self.addEventListener('sync', (event) => {
  console.log('[SW] 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // 오프라인에서 저장된 작업들을 처리
  console.log('[SW] 백그라운드 동기화 실행');
}

// 푸시 알림 처리 (미래 확장용)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('[SW] AI 코드 리뷰어 서비스 워커가 로드되었습니다.');