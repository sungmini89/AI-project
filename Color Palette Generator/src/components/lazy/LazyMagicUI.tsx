import { lazy, Suspense } from 'react';
import { ComponentLoadingSpinner } from '../ui/loading-spinner';

// Magic UI 컴포넌트들을 레이지 로딩
export const LazyColorTransition = lazy(() => 
  import('../magicui/color-transition').then(module => ({
    default: module.ColorTransition
  }))
);

export const LazyPaletteReveal = lazy(() => 
  import('../magicui/color-transition').then(module => ({
    default: module.PaletteReveal
  }))
);

export const LazyHarmonyVisualizer = lazy(() => 
  import('../magicui/harmony-visualizer').then(module => ({
    default: module.HarmonyVisualizer
  }))
);

export const LazyColorWheel = lazy(() => 
  import('../magicui/harmony-visualizer').then(module => ({
    default: module.ColorWheel
  }))
);

export const LazyAccessibilityIndicator = lazy(() => 
  import('../magicui/accessibility-indicator').then(module => ({
    default: module.AccessibilityIndicator
  }))
);

export const LazyColorBlindSimulator = lazy(() => 
  import('../magicui/accessibility-indicator').then(module => ({
    default: module.ColorBlindSimulator
  }))
);

// Wrapper 컴포넌트들 - 로딩 상태와 함께 제공
export function ColorTransition(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="색상 애니메이션 로딩..." />}>
      <LazyColorTransition {...props} />
    </Suspense>
  );
}

export function PaletteReveal(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="팔레트 애니메이션 로딩..." />}>
      <LazyPaletteReveal {...props} />
    </Suspense>
  );
}

export function HarmonyVisualizer(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="조화 시각화 로딩..." />}>
      <LazyHarmonyVisualizer {...props} />
    </Suspense>
  );
}

export function ColorWheel(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="색상환 로딩..." />}>
      <LazyColorWheel {...props} />
    </Suspense>
  );
}

export function AccessibilityIndicator(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="접근성 분석 로딩..." />}>
      <LazyAccessibilityIndicator {...props} />
    </Suspense>
  );
}

export function ColorBlindSimulator(props: any) {
  return (
    <Suspense fallback={<ComponentLoadingSpinner text="색맹 시뮬레이터 로딩..." />}>
      <LazyColorBlindSimulator {...props} />
    </Suspense>
  );
}