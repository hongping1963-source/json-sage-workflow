/**
 * SmolVLM基础模型接口
 * 定义了模型的基本操作和配置
 */

export interface ModelConfig {
  // 基础配置
  modelPath: string;
  deviceType?: 'cpu' | 'gpu';
  
  // 边缘计算配置
  quantization?: 'int8' | 'fp16' | 'none';
  memoryLimit?: number;
  powerMode?: 'high' | 'balanced' | 'low';
  
  // 高级配置
  offlineSupport?: boolean;
  cacheStrategy?: 'aggressive' | 'balanced' | 'minimal';
}

export interface ModelMetrics {
  memoryUsage: number;
  inferenceTime: number;
  powerConsumption?: number;
  deviceUtilization: {
    cpu: number;
    gpu?: number;
  };
}

export abstract class BaseModel {
  protected config: ModelConfig;
  protected metrics: ModelMetrics;

  constructor(config: ModelConfig) {
    this.config = config;
    this.metrics = {
      memoryUsage: 0,
      inferenceTime: 0,
      deviceUtilization: {
        cpu: 0
      }
    };
  }

  /**
   * 加载模型
   * @returns Promise<void>
   */
  abstract load(): Promise<void>;

  /**
   * 模型推理
   * @param input 输入数据
   * @returns 推理结果
   */
  abstract predict(input: any): Promise<any>;

  /**
   * 释放资源
   */
  abstract dispose(): Promise<void>;

  /**
   * 获取性能指标
   */
  getMetrics(): ModelMetrics {
    return this.metrics;
  }

  /**
   * 优化模型
   * 可以包括量化、剪枝等操作
   */
  abstract optimize(): Promise<void>;

  /**
   * 更新配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
