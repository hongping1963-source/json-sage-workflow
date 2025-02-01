import { ModelFormat, QuantizationConfig, OptimizationResult } from './smolvlm';

export interface ExporterConfig {
    tempDir?: string;
    maxConcurrent?: number;
    cleanup?: boolean;
}

export interface ConversionOptions {
    sourceFormat: ModelFormat;
    targetFormat: ModelFormat;
    optimization?: {
        enabled: boolean;
        level?: 1 | 2 | 3;
        options?: {
            pruning?: boolean;
            clustering?: boolean;
            layerFusion?: boolean;
        };
    };
    quantization?: QuantizationConfig;
}

export interface ExportResult {
    success: boolean;
    outputPath?: string;
    format: ModelFormat;
    size: number;
    optimization?: OptimizationResult;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface BatchExportConfig {
    models: Array<{
        path: string;
        format: ModelFormat;
        options?: ConversionOptions;
    }>;
    outputDir: string;
    parallel?: boolean;
}

export interface ExportProgress {
    total: number;
    completed: number;
    failed: number;
    current?: {
        model: string;
        stage: 'converting' | 'optimizing' | 'validating';
        progress: number;
    };
}

export interface ValidationConfig {
    testDataset?: string;
    metrics?: Array<'accuracy' | 'latency' | 'memory'>;
    threshold?: {
        accuracy?: number;
        latency?: number;
        memory?: number;
    };
}

export interface CompressionConfig {
    method: 'gzip' | 'brotli' | 'zstd';
    level?: number;
    dictionary?: Buffer;
}

export interface ExportMetadata {
    timestamp: number;
    source: {
        format: ModelFormat;
        size: number;
        hash: string;
    };
    target: {
        format: ModelFormat;
        size: number;
        hash: string;
    };
    conversion: {
        duration: number;
        options: ConversionOptions;
    };
    validation?: {
        accuracy: number;
        latency: number;
        memory: number;
    };
}
