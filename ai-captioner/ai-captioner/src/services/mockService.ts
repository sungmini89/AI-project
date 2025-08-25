export async function callMock(type: 'seo'|'sns'|'accessible'): Promise<string> {
  await new Promise((r) => setTimeout(r, 400));
  const samples = {
    seo: '고해상도 도시 전경, 노을 하늘과 반짝이는 스카이라인 — 키워드: 도시야경, 석양, 스카이라인, 여행',
    sns: '노을 타이밍에 딱 맞춘 한 장! ✨ 도시의 불빛이 켜질 때, 오늘 하루도 수고했어요 🌇',
    accessible: '노을 지는 하늘 아래 고층 빌딩들이 줄지어 서 있고, 창문 불빛이 켜지기 시작한 저녁 도시 풍경'
  } as const;
  return samples[type];
}
