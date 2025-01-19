import { JsonSageWorkflow } from './core/Workflow';
import { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';

// 创建默认实例
const defaultWorkflow = new JsonSageWorkflow();

// 导出简单API
export const json = {
    parse: (data: string) => defaultWorkflow.parse(data),
    stringify: (data: any) => defaultWorkflow.stringify(data),
    getPerformanceReport: () => defaultWorkflow.getPerformanceReport(),
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
        return workflow.generateSchema(json, options);
    }
};

// 导出完整API以供高级用户使用
export { JsonSageWorkflow } from './core/Workflow';
export { JsonSageAutoDetector } from './core/AutoDetector';
export { ProjectAnalyzer } from './core/ProjectAnalyzer';
export { PerformanceOptimizer } from './core/PerformanceOptimizer';
export { DeepSeekConfig, SchemaGenerationOptions } from './core/DeepSeekService';
