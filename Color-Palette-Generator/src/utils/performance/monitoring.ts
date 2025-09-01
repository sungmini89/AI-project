// Real-time Performance Monitoring System
import React from 'react';
interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: number;
}

interface AlertConfig {
  threshold: number;
  cooldown: number;
  lastAlert: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  
  private alerts: Record<string, AlertConfig> = {
    responseTime: { threshold: 2000, cooldown: 300000, lastAlert: 0 },
    memoryUsage: { threshold: 0.8, cooldown: 300000, lastAlert: 0 },
    errorRate: { threshold: 0.05, cooldown: 600000, lastAlert: 0 }
  };

  private observers: ((metric: PerformanceMetrics) => void)[] = [];

  recordMetric(metric: Partial<PerformanceMetrics>) {
    const fullMetric: PerformanceMetrics = {
      responseTime: metric.responseTime || 0,
      memoryUsage: metric.memoryUsage || this.getMemoryUsage(),
      cacheHitRate: metric.cacheHitRate || 0,
      errorRate: metric.errorRate || 0,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    this.checkAlerts(fullMetric);
    this.notifyObservers(fullMetric);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    }
    return 0;
  }

  private checkAlerts(metric: PerformanceMetrics) {
    const now = Date.now();

    // Response time alert
    if (metric.responseTime > this.alerts.responseTime.threshold &&
        now - this.alerts.responseTime.lastAlert > this.alerts.responseTime.cooldown) {
      this.triggerAlert('responseTime', metric.responseTime);
      this.alerts.responseTime.lastAlert = now;
    }

    // Memory usage alert
    if (metric.memoryUsage > this.alerts.memoryUsage.threshold &&
        now - this.alerts.memoryUsage.lastAlert > this.alerts.memoryUsage.cooldown) {
      this.triggerAlert('memoryUsage', metric.memoryUsage);
      this.alerts.memoryUsage.lastAlert = now;
    }

    // Error rate alert
    if (metric.errorRate > this.alerts.errorRate.threshold &&
        now - this.alerts.errorRate.lastAlert > this.alerts.errorRate.cooldown) {
      this.triggerAlert('errorRate', metric.errorRate);
      this.alerts.errorRate.lastAlert = now;
    }
  }

  private triggerAlert(type: string, value: number) {
    console.warn(`🚨 Performance Alert: ${type} = ${value}`);
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_alert', {
        alert_type: type,
        value: value,
        timestamp: Date.now()
      });
    }
  }

  private notifyObservers(metric: PerformanceMetrics) {
    this.observers.forEach(observer => {
      try {
        observer(metric);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  subscribe(callback: (metric: PerformanceMetrics) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  getAverageMetrics(windowMs: number = 300000): Partial<PerformanceMetrics> {
    const cutoff = Date.now() - windowMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    if (recentMetrics.length === 0) return {};

    return {
      responseTime: recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length,
      memoryUsage: recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length,
      cacheHitRate: recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length,
      errorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
    };
  }

  getHealthStatus(): 'good' | 'warning' | 'critical' {
    const recent = this.getAverageMetrics();
    
    if ((recent.responseTime && recent.responseTime > 3000) || 
        (recent.memoryUsage && recent.memoryUsage > 0.9) || 
        (recent.errorRate && recent.errorRate > 0.1)) {
      return 'critical';
    }
    
    if ((recent.responseTime && recent.responseTime > 1500) || 
        (recent.memoryUsage && recent.memoryUsage > 0.7) || 
        (recent.errorRate && recent.errorRate > 0.02)) {
      return 'warning';
    }
    
    return 'good';
  }

  generateReport(): string {
    const metrics = this.getAverageMetrics();
    const health = this.getHealthStatus();
    
    return `📊 Performance Report (${health.toUpperCase()})
⚡ Response Time: ${metrics.responseTime?.toFixed(0) || 'N/A'}ms
🧠 Memory Usage: ${metrics.memoryUsage ? (metrics.memoryUsage * 100).toFixed(1) : 'N/A'}%
💾 Cache Hit Rate: ${metrics.cacheHitRate ? (metrics.cacheHitRate * 100).toFixed(1) : 'N/A'}%
🚨 Error Rate: ${metrics.errorRate ? (metrics.errorRate * 100).toFixed(2) : 'N/A'}%
📈 Samples: ${this.metrics.length}`;
  }
}

// Global monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance measurement utilities
export const measureAsync = async <T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await operation();
    const responseTime = performance.now() - start;
    
    performanceMonitor.recordMetric({
      responseTime,
      errorRate: 0
    });
    
    console.log(`⚡ ${label}: ${responseTime.toFixed(2)}ms`);
    return result;
    
  } catch (error) {
    const responseTime = performance.now() - start;
    
    performanceMonitor.recordMetric({
      responseTime,
      errorRate: 1
    });
    
    console.error(`❌ ${label} failed: ${responseTime.toFixed(2)}ms`, error);
    throw error;
  }
};

export const measureSync = <T>(
  operation: () => T,
  label: string
): T => {
  const start = performance.now();
  
  try {
    const result = operation();
    const responseTime = performance.now() - start;
    
    performanceMonitor.recordMetric({
      responseTime,
      errorRate: 0
    });
    
    console.log(`⚡ ${label}: ${responseTime.toFixed(2)}ms`);
    return result;
    
  } catch (error) {
    const responseTime = performance.now() - start;
    
    performanceMonitor.recordMetric({
      responseTime,
      errorRate: 1
    });
    
    console.error(`❌ ${label} failed: ${responseTime.toFixed(2)}ms`, error);
    throw error;
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = React.useState<'good' | 'warning' | 'critical'>('good');

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((metric) => {
      setMetrics(metric);
      setHealth(performanceMonitor.getHealthStatus());
    });

    return unsubscribe;
  }, []);

  return {
    metrics,
    health,
    averageMetrics: performanceMonitor.getAverageMetrics(),
    report: performanceMonitor.generateReport()
  };
};