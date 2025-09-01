// Vercel Health Check API Endpoint
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // 기본 헬스체크 정보
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'local',
      version: process.env.npm_package_version || '1.0.0',
      node_version: process.version,
      memory: process.memoryUsage(),
      response_time_ms: Date.now() - startTime
    };

    // 환경별 추가 정보
    if (process.env.VERCEL_ENV === 'production') {
      healthData.deployment = {
        url: process.env.VERCEL_URL,
        git_commit_sha: process.env.VERCEL_GIT_COMMIT_SHA,
        git_commit_message: process.env.VERCEL_GIT_COMMIT_MESSAGE,
        git_repo: process.env.VERCEL_GIT_REPO_SLUG,
        git_branch: process.env.VERCEL_GIT_COMMIT_REF
      };
    }

    // 외부 API 연결 상태 확인 (간단한 테스트)
    const externalServices = await checkExternalServices();
    healthData.external_services = externalServices;

    // 응답 시간 측정
    healthData.response_time_ms = Date.now() - startTime;

    // 상태 코드 결정
    const allServicesHealthy = Object.values(externalServices).every(
      service => service.status === 'ok'
    );
    
    const statusCode = allServicesHealthy ? 200 : 207; // 207: Multi-Status
    
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || 'local'
    });
  }
}

// 외부 서비스 상태 확인
async function checkExternalServices() {
  const services = {
    colormind: {
      url: 'https://colormind.io/api/',
      status: 'unknown',
      response_time_ms: 0
    },
    thecolorapi: {
      url: 'https://www.thecolorapi.com/',
      status: 'unknown', 
      response_time_ms: 0
    }
  };

  // 각 서비스에 대해 병렬로 확인
  const promises = Object.entries(services).map(async ([name, service]) => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃
      
      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'AI-Color-Palette-Generator/1.0 Health-Check'
        }
      });
      
      clearTimeout(timeoutId);
      
      services[name].status = response.ok ? 'ok' : 'error';
      services[name].response_time_ms = Date.now() - startTime;
      services[name].http_status = response.status;
      
    } catch (error) {
      services[name].status = 'error';
      services[name].response_time_ms = Date.now() - startTime;
      services[name].error = error.name === 'AbortError' ? 'timeout' : error.message;
    }
  });

  await Promise.allSettled(promises);
  return services;
}