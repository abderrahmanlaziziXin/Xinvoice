/**
 * Performance monitoring utilities for PDF generation
 * Tracks performance metrics and provides optimization insights
 */

interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean

  constructor() {
    // Enable in development mode
    this.isEnabled = process.env.NODE_ENV === 'development'
  }

  /**
   * Start measuring an operation
   */
  startOperation(operation: string): (metadata?: Record<string, any>) => void {
    if (!this.isEnabled) return () => {}

    const startTime = performance.now()
    
    return (metadata?: Record<string, any>) => {
      const duration = performance.now() - startTime
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        metadata
      })
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Log performance warning for slow operations
    if (metric.duration > 5000) { // 5 seconds
      console.warn(`⚠️ Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`)
    }

    // Log to console in development
    console.log(`📊 ${metric.operation}: ${metric.duration.toFixed(2)}ms`)
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalOperations: number
    averageDuration: number
    slowestOperation: PerformanceMetric | null
    operationCounts: Record<string, number>
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        operationCounts: {}
      }
    }

    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0)
    const averageDuration = totalDuration / this.metrics.length
    const slowestOperation = this.metrics.reduce((slowest, current) => 
      current.duration > (slowest?.duration || 0) ? current : slowest
    )

    const operationCounts = this.metrics.reduce((counts, metric) => {
      counts[metric.operation] = (counts[metric.operation] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    return {
      totalOperations: this.metrics.length,
      averageDuration,
      slowestOperation,
      operationCounts
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(operation?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const operationName = operation || `${target.constructor.name}.${propertyKey}`
    
    descriptor.value = function (...args: any[]) {
      const endMeasurement = performanceMonitor.startOperation(operationName)
      
      try {
        const result = originalMethod.apply(this, args)
        
        // Handle async methods
        if (result instanceof Promise) {
          return result.finally(() => endMeasurement())
        }
        
        endMeasurement()
        return result
        
      } catch (error) {
        endMeasurement({ error: error instanceof Error ? error.message : 'Unknown error' })
        throw error
      }
    }
    
    return descriptor
  }
}

/**
 * Measure an async operation
 */
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const endMeasurement = performanceMonitor.startOperation(operation)
  
  try {
    const result = await fn()
    endMeasurement()
    return result
  } catch (error) {
    endMeasurement({ error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}

/**
 * Measure a synchronous operation
 */
export function measureSync<T>(
  operation: string,
  fn: () => T
): T {
  const endMeasurement = performanceMonitor.startOperation(operation)
  
  try {
    const result = fn()
    endMeasurement()
    return result
  } catch (error) {
    endMeasurement({ error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  return {
    startOperation: performanceMonitor.startOperation.bind(performanceMonitor),
    getStats: performanceMonitor.getStats.bind(performanceMonitor),
    clear: performanceMonitor.clear.bind(performanceMonitor),
    exportMetrics: performanceMonitor.exportMetrics.bind(performanceMonitor)
  }
}
