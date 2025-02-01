import { z } from 'zod';

// 基础配置类型
export const ConfigSchema = z.object({
  aiProvider: z.enum(['deepseek', 'smolvlm']),
  apiKey: z.string(),
  enableLogging: z.boolean().optional().default(false),
  visionOptions: z.object({
    modelSize: z.enum(['256M', '500M']).optional().default('256M'),
    maxResolution: z.number().optional().default(512),
  }).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

// JSON处理相关类型
export interface JsonProcessResult {
  schema: object;
  analysis: {
    type: string;
    structure: string;
    suggestions: string[];
  };
  validation: {
    isValid: boolean;
    errors?: string[];
  };
}

// 视觉处理相关类型
export interface VisionProcessOptions {
  json: object;
  image: Buffer | string; // Buffer for raw image data, string for base64 or URL
  query?: string;
}

export interface VisionProcessResult {
  description: string;
  analysis: {
    relevance: number;
    confidence: number;
    suggestions: string[];
  };
  jsonMapping?: {
    imageElements: string[];
    matchedProperties: Record<string, string>;
  };
}

// 错误类型
export class JsonSageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: object
  ) {
    super(message);
    this.name = 'JsonSageError';
  }
}

// AI Provider接口
export interface AIProvider {
  processJson(json: object): Promise<JsonProcessResult>;
  processVision?(options: VisionProcessOptions): Promise<VisionProcessResult>;
}

// 性能监控类型
export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  operation: string;
  success: boolean;
  error?: string;
}
