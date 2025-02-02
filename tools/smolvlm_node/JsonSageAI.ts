import { WorkflowCoordinator } from './coordinator';
import { AgentConfig, SchemaGenerationTask, AgentResult } from './types';

export class JsonSageAI {
    private coordinator: WorkflowCoordinator;

    constructor(config: AgentConfig) {
        this.coordinator = new WorkflowCoordinator(config);
    }

    /**
     * 执行完整的JSON Schema生成工作流
     * @param task Schema生成任务配置
     * @returns 包含schema、描述和示例的结果
     */
    async generateSchema(task: SchemaGenerationTask): Promise<AgentResult> {
        return this.coordinator.executeWorkflow(task);
    }

    /**
     * 创建新的JsonSageAI实例
     * @param config Agent配置
     * @returns JsonSageAI实例
     */
    static create(config: AgentConfig): JsonSageAI {
        return new JsonSageAI(config);
    }
}
