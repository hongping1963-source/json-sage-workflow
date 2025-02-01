import { PerformanceMetrics } from '../types';

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics>;
  private counter: number;

  constructor() {
    this.metrics = new Map();
    this.counter = 0;
  }

  start(operation: string): string {
    const id = `${operation}_${this.counter++}`;
    this.metrics.set(id, {
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      operation,
      success: false,
    });
    return id;
  }

  end(id: string, success: boolean, error?: any): void {
    const metric = this.metrics.get(id);
    if (metric) {
      const endTime = Date.now();
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      metric.success = success;
      if (error) {
        metric.error = error.message || String(error);
      }
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  getMetricById(id: string): PerformanceMetrics | undefined {
    return this.metrics.get(id);
  }

  clear(): void {
    this.metrics.clear();
    this.counter = 0;
  }
}
