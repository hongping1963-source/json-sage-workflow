import { ModelConfig } from './index';

export interface SmolVLMConfig {
    modelPath: string;
    deviceType: 'cpu' | 'gpu';
    maxBatchSize?: number;
    threads?: number;
    cacheSize?: number;
    quantization?: QuantizationConfig;
}

export interface QuantizationConfig {
    type: 'int8' | 'int16' | 'float16';
    calibrationDataset?: string;
    threshold?: number;
}

export interface ModelFormat {
    type: 'onnx' | 'tensorflow' | 'tflite' | 'torchscript';
    version: string;
}

export interface ExportConfig {
    format: ModelFormat;
    outputPath: string;
    optimize?: boolean;
    quantize?: QuantizationConfig;
    compress?: boolean;
}

export interface ProcessorConfig {
    imageSize: number;
    meanValues?: number[];
    stdValues?: number[];
    channels?: number;
    dtype?: 'float32' | 'uint8';
}

export interface InferenceResult {
    predictions: Array<{
        label: string;
        confidence: number;
    }>;
    timing: {
        preprocess: number;
        inference: number;
        postprocess: number;
    };
}

export interface OptimizationResult {
    originalSize: number;
    optimizedSize: number;
    speedup: number;
    memoryReduction: number;
    metrics: {
        latency: number;
        throughput: number;
        memoryUsage: number;
    };
}

export interface VersionInfo {
    id: string;
    timestamp: number;
    format: ModelFormat;
    size: number;
    hash: string;
    config: {
        model: ModelConfig;
        processor: ProcessorConfig;
        optimization?: OptimizationResult;
    };
    metadata?: Record<string, any>;
}

export interface TokenizerConfig {
    vocabPath: string;
    maxLength: number;
    padding?: boolean;
    truncation?: boolean;
    addSpecialTokens?: boolean;
}

export interface ImageProcessingConfig {
    resize?: {
        width: number;
        height: number;
        method?: 'bilinear' | 'bicubic' | 'nearest';
    };
    normalize?: {
        mean: number[];
        std: number[];
    };
    augment?: {
        flip?: boolean;
        rotate?: boolean;
        brightness?: number;
        contrast?: number;
    };
}

export interface ModelMetrics {
    parameters: number;
    size: number;
    flops: number;
    layerCount: number;
    performance: {
        latency: number;
        throughput: number;
        memoryUsage: number;
    };
}
