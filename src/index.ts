import { JsonSageWorkflow } from './core/Workflow';
import { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';
import { safeJsonParse, safeExecute } from './utils/ErrorHandler';
import { DEFAULT_CONFIG } from './config/defaults';
import { ModelLoader } from './core/model/loader';
import { ModelProcessor } from './core/model/processor';
import { ModelOptimizer } from './core/optimization/optimizer';
import { ModelExporter } from './core/export/exporter';
import { VersionManager } from './core/versioning/manager';

// 创建默认实例
const defaultWorkflow = new JsonSageWorkflow();

// 导出简单API
export const json = {
    parse: async (data: string) => {
        const result = safeJsonParse(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data;
    },

    stringify: (data: any) => {
        return safeExecute(() => defaultWorkflow.stringify(data));
    },

    getPerformanceReport: () => {
        return safeExecute(() => defaultWorkflow.getPerformanceReport());
    },

    generateSchema: async (json: string, options?: SchemaGenerationOptions) => {
        const workflow = new JsonSageWorkflow({
            watch: false,
            autoProcess: false,
            generateTypes: false,
            ...options
        });

        return safeExecute(async () => {
            await workflow.initialize();
            return workflow.generateSchema(json);
        });
    }
};

// 导出核心组件
export { JsonSageWorkflow } from './core/Workflow';
export { JsonSageAutoDetector } from './core/AutoDetector';
export { ModelLoader } from './core/model/loader';
export { ModelProcessor } from './core/model/processor';
export { ModelOptimizer } from './core/optimization/optimizer';
export { ModelExporter } from './core/export/exporter';
export { VersionManager } from './core/versioning/manager';

// 导出类型
export type { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';
export type { ModelConfig } from './core/model/base';
export type { ProcessorConfig } from './core/model/processor';
export type { OptimizerConfig } from './core/optimization/optimizer';
export type { ExportConfig, ExportFormat } from './core/export/exporter';
export type { VersionManagerConfig } from './core/versioning/manager';
