# Multi-stage build for production optimization
FROM node:18-alpine as builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일들 복사
COPY package*.json ./
COPY yarn.lock* ./

# 의존성 설치 (캐시 활용)
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# 환경변수 설정
ENV NODE_ENV=production
ENV VITE_APP_ENV=production

# 프로덕션 빌드
RUN npm run build

# 프로덕션 서버 단계
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# PWA 파일들을 올바른 위치에 복사
COPY --from=builder /app/dist/sw.js /usr/share/nginx/html/
COPY --from=builder /app/dist/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/dist/offline.html /usr/share/nginx/html/

# 헬스체크 스크립트 추가
COPY docker/healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# 권한 설정
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# 보안 강화: 루트 사용자 제거
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# 포트 노출
EXPOSE 8080

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck.sh

# 라벨 추가 (메타데이터)
LABEL maintainer="AI Color Palette Generator Team"
LABEL version="1.0.0"
LABEL description="AI-powered color palette generator with PWA support"
LABEL org.opencontainers.image.source="https://github.com/your-username/ai-color-palette-generator"
LABEL org.opencontainers.image.description="한국어 키워드 기반 지능형 색상 팔레트 생성기"
LABEL org.opencontainers.image.licenses="MIT"

# 컨테이너 실행
CMD ["nginx", "-g", "daemon off;"]