import { SchemaAgent, DescriptionAgent, ExampleAgent } from '../agent';
import { AgentConfig, SchemaGenerationTask, AgentResult } from '../types';

export class WorkflowCoordinator {
    private schemaAgent: SchemaAgent;
    private descriptionAgent: DescriptionAgent;
    private exampleAgent: ExampleAgent;

    constructor(config: AgentConfig) {
        this.schemaAgent = new SchemaAgent(config);
        this.descriptionAgent = new DescriptionAgent(config);
        this.exampleAgent = new ExampleAgent(config);
    }

    async executeWorkflow(task: SchemaGenerationTask): Promise<AgentResult> {
        const steps: string[] = [];
        const startTime = Date.now();

        try {
            // Step 1: Generate Schema
            steps.push('Generating Schema');
            const schemaResult = await this.schemaAgent.generateSchema(task);
            const { schema } = schemaResult;

            // Step 2: Generate Descriptions
            steps.push('Generating Field Descriptions');
            const descriptionResult = await this.descriptionAgent.generateDescriptions(task.jsonData);
            const { descriptions } = descriptionResult;

            // Step 3: Generate Examples
            steps.push('Generating Examples');
            const exampleResult = await this.exampleAgent.generateExamples(schema);
            const { examples } = exampleResult;

            const executionTime = Date.now() - startTime;

            return {
                schema,
                descriptions,
                examples,
                metadata: {
                    executionTime,
                    steps
                }
            };
        } catch (error) {
            console.error('Workflow execution failed:', error);
            throw new Error(`Workflow execution failed: ${error.message}`);
        }
    }
}
