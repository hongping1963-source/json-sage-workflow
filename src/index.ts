import { JsonSageWorkflow } from './core/Workflow';
import { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';
import { safeJsonParse, safeExecute } from './utils/ErrorHandler';
import { DEFAULT_CONFIG } from './config/defaults';

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
            autoOptimize: false,
            compression: false,
            validation: false,
            caching: true,
            deepseek: {
                apiKey: process.env.DEEPSEEK_API_KEY
            }
        });

        return safeExecute(async () => {
            const parseResult = safeJsonParse(json);
            if (!parseResult.success) {
                throw parseResult.error;
            }
            return workflow.generateSchema(json, options);
        });
    }
};

// 导出完整API以供高级用户使用
export { JsonSageWorkflow } from './core/Workflow';
export { JsonSageAutoDetector } from './core/AutoDetector';
export { ProjectAnalyzer } from './core/ProjectAnalyzer';
export { PerformanceOptimizer } from './core/PerformanceOptimizer';
export { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';
export { DEFAULT_CONFIG } from './config/defaults';
export * from './utils/ErrorHandler';
