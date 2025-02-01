/**
 * 错误类型
 */
export enum ErrorType {
  // 模型相关错误
  MODEL_LOAD_ERROR = 'MODEL_LOAD_ERROR',
  MODEL_INIT_ERROR = 'MODEL_INIT_ERROR',
  MODEL_INFERENCE_ERROR = 'MODEL_INFERENCE_ERROR',
  MODEL_OPTIMIZATION_ERROR = 'MODEL_OPTIMIZATION_ERROR',

  // 内存相关错误
  MEMORY_ALLOCATION_ERROR = 'MEMORY_ALLOCATION_ERROR',
  MEMORY_LIMIT_ERROR = 'MEMORY_LIMIT_ERROR',

  // 输入输出错误
  INVALID_INPUT_ERROR = 'INVALID_INPUT_ERROR',
  PREPROCESSING_ERROR = 'PREPROCESSING_ERROR',
  POSTPROCESSING_ERROR = 'POSTPROCESSING_ERROR',

  // 系统错误
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  RESOURCE_ERROR = 'RESOURCE_ERROR',

  // 其他错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 自定义错误类
 */
export class SmolVLMError extends Error {
  readonly type: ErrorType;
  readonly details?: any;
  readonly timestamp: string;

  constructor(type: ErrorType, message: string, details?: any) {
    super(message);
    this.name = 'SmolVLMError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * 获取错误详情
   */
  getErrorInfo(): Record<string, any> {
    return {
      type: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  /**
   * 创建模型加载错误
   */
  static modelLoadError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MODEL_LOAD_ERROR, message, details);
  }

  /**
   * 创建模型初始化错误
   */
  static modelInitError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MODEL_INIT_ERROR, message, details);
  }

  /**
   * 创建推理错误
   */
  static inferenceError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MODEL_INFERENCE_ERROR, message, details);
  }

  /**
   * 创建优化错误
   */
  static optimizationError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MODEL_OPTIMIZATION_ERROR, message, details);
  }

  /**
   * 创建内存分配错误
   */
  static memoryAllocationError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MEMORY_ALLOCATION_ERROR, message, details);
  }

  /**
   * 创建内存限制错误
   */
  static memoryLimitError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.MEMORY_LIMIT_ERROR, message, details);
  }

  /**
   * 创建输入验证错误
   */
  static invalidInputError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.INVALID_INPUT_ERROR, message, details);
  }

  /**
   * 创建预处理错误
   */
  static preprocessingError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.PREPROCESSING_ERROR, message, details);
  }

  /**
   * 创建后处理错误
   */
  static postprocessingError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.POSTPROCESSING_ERROR, message, details);
  }

  /**
   * 创建系统错误
   */
  static systemError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.SYSTEM_ERROR, message, details);
  }

  /**
   * 创建资源错误
   */
  static resourceError(message: string, details?: any): SmolVLMError {
    return new SmolVLMError(ErrorType.RESOURCE_ERROR, message, details);
  }
}
