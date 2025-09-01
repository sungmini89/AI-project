#!/bin/sh

# Docker 컨테이너 헬스체크 스크립트
# AI Color Palette Generator 애플리케이션 상태 확인

set -e

# 색상 출력을 위한 함수
red() { printf "\033[31m%s\033[0m" "$1"; }
green() { printf "\033[32m%s\033[0m" "$1"; }
yellow() { printf "\033[33m%s\033[0m" "$1"; }

# 기본 설정
HOST=${HOST:-localhost}
PORT=${PORT:-8080}
TIMEOUT=${TIMEOUT:-3}

echo "🏥 AI Color Palette Generator 헬스체크 시작..."

# 1. Nginx 프로세스 확인
if ! pgrep nginx > /dev/null; then
    red "❌ Nginx 프로세스가 실행되지 않음"
    exit 1
fi
green "✅ Nginx 프로세스 실행 중"

# 2. 포트 리스닝 확인
if ! netstat -tuln 2>/dev/null | grep ":${PORT}" > /dev/null; then
    red "❌ 포트 ${PORT}에서 서비스가 실행되지 않음"
    exit 1
fi
green "✅ 포트 ${PORT} 리스닝 중"

# 3. HTTP 응답 확인
HTTP_STATUS=$(wget --spider --server-response --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/health" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

if [ "$HTTP_STATUS" != "200" ]; then
    red "❌ 헬스체크 엔드포인트 응답 실패 (HTTP ${HTTP_STATUS})"
    exit 1
fi
green "✅ 헬스체크 엔드포인트 응답 정상 (HTTP 200)"

# 4. 메인 페이지 확인
MAIN_STATUS=$(wget --spider --server-response --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

if [ "$MAIN_STATUS" != "200" ]; then
    red "❌ 메인 페이지 응답 실패 (HTTP ${MAIN_STATUS})"
    exit 1
fi
green "✅ 메인 페이지 응답 정상 (HTTP 200)"

# 5. PWA 매니페스트 확인
MANIFEST_STATUS=$(wget --spider --server-response --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/manifest.json" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

if [ "$MANIFEST_STATUS" != "200" ]; then
    yellow "⚠️  PWA 매니페스트 응답 실패 (HTTP ${MANIFEST_STATUS})"
else
    green "✅ PWA 매니페스트 응답 정상"
fi

# 6. Service Worker 확인
SW_STATUS=$(wget --spider --server-response --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/sw.js" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')

if [ "$SW_STATUS" != "200" ]; then
    yellow "⚠️  Service Worker 응답 실패 (HTTP ${SW_STATUS})"
else
    green "✅ Service Worker 응답 정상"
fi

# 7. 디스크 사용량 확인
DISK_USAGE=$(df /usr/share/nginx/html | tail -1 | awk '{print $5}' | sed 's/%//')

if [ "$DISK_USAGE" -gt 90 ]; then
    red "❌ 디스크 사용량 임계점 초과: ${DISK_USAGE}%"
    exit 1
elif [ "$DISK_USAGE" -gt 80 ]; then
    yellow "⚠️  디스크 사용량 높음: ${DISK_USAGE}%"
else
    green "✅ 디스크 사용량 정상: ${DISK_USAGE}%"
fi

# 8. 메모리 사용량 확인
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')

if [ "$MEMORY_USAGE" -gt 90 ]; then
    red "❌ 메모리 사용량 임계점 초과: ${MEMORY_USAGE}%"
    exit 1
elif [ "$MEMORY_USAGE" -gt 80 ]; then
    yellow "⚠️  메모리 사용량 높음: ${MEMORY_USAGE}%"
else
    green "✅ 메모리 사용량 정상: ${MEMORY_USAGE}%"
fi

# 9. 로그 에러 확인
ERROR_COUNT=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "error" || echo "0")

if [ "$ERROR_COUNT" -gt 10 ]; then
    yellow "⚠️  최근 Nginx 에러 로그 다수: ${ERROR_COUNT}개"
else
    green "✅ Nginx 에러 로그 정상 수준"
fi

# 10. 응답 시간 확인
RESPONSE_TIME=$(wget --spider --timeout="${TIMEOUT}" "http://${HOST}:${PORT}/" 2>&1 | grep "response" | awk '{print $4}' | sed 's/s//' || echo "0")

# 부동소수점 비교를 위한 함수
compare_float() {
    awk "BEGIN {exit !($1 $2 $3)}"
}

if compare_float "$RESPONSE_TIME" ">" "2.0"; then
    yellow "⚠️  응답 시간 느림: ${RESPONSE_TIME}초"
elif compare_float "$RESPONSE_TIME" ">" "1.0"; then
    yellow "⚠️  응답 시간 보통: ${RESPONSE_TIME}초"
else
    green "✅ 응답 시간 빠름: ${RESPONSE_TIME}초"
fi

# 최종 결과
echo ""
green "🎉 헬스체크 완료 - 모든 핵심 서비스가 정상 작동 중"

# 추가 정보 출력
echo ""
echo "📊 시스템 정보:"
echo "   • 호스트: ${HOST}:${PORT}"
echo "   • Nginx 버전: $(nginx -v 2>&1 | cut -d: -f2 | tr -d ' ')"
echo "   • 디스크 사용량: ${DISK_USAGE}%"
echo "   • 메모리 사용량: ${MEMORY_USAGE}%"
echo "   • 응답 시간: ${RESPONSE_TIME}초"
echo "   • 최근 에러: ${ERROR_COUNT}개"

exit 0