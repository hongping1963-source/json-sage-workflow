import { BaseAgent } from './BaseAgent';
import { AgentConfig, SchemaGenerationTask } from '../types';
import { NLUParser } from './NLUParser';
import { SchemaGenerator, JSONSchema } from './SchemaGenerator';
import { JsonAnalyzer } from './JsonAnalyzer';

interface SchemaResult {
    schema: JSONSchema;
    metadata: {
        executionTime: number;
        steps: string[];
        insights: string[];
    };
}

export class SchemaAgent extends BaseAgent {
    private nluParser: NLUParser;
    private schemaGenerator: SchemaGenerator;
    private jsonAnalyzer: JsonAnalyzer;

    constructor(config: AgentConfig) {
        super(config);
        this.nluParser = new NLUParser(config.deepseekApiKey);
        this.schemaGenerator = new SchemaGenerator();
        this.jsonAnalyzer = new JsonAnalyzer();
    }

    async generateSchema(task: SchemaGenerationTask): Promise<SchemaResult> {
        const startTime = Date.now();
        const steps: string[] = [];
        const insights: string[] = [];

        try {
            // Step 1: Analyze input data
            steps.push('Analyzing input data');
            const analysis = await this.jsonAnalyzer.analyze(task.jsonData);
            insights.push(...analysis.insights);

            // Step 2: Process natural language understanding
            steps.push('Processing natural language understanding');
            const nluResult = await this.nluParser.parse(JSON.stringify(task.jsonData));

            // Step 3: Generate JSON Schema
            steps.push('Generating JSON Schema');
            const schema = await this.schemaGenerator.generate(nluResult);

            // Step 4: Apply additional options and customizations
            steps.push('Applying customizations');
            this.applyCustomizations(schema, task.options);

            // Step 5: Validate the generated schema
            steps.push('Validating schema');
            await this.validateSchema(schema);

            const executionTime = Date.now() - startTime;
            console.log(`Schema generation completed in ${executionTime}ms`);

            return {
                schema,
                metadata: {
                    executionTime,
                    steps,
                    insights
                }
            };
        } catch (error) {
            console.error('Error generating schema:', error);
            throw new Error(`Schema generation failed: ${error.message}`);
        }
    }

    private applyCustomizations(schema: JSONSchema, options?: any): void {
        if (!options) return;

        // Apply format version
        if (options.format) {
            schema.$schema = `http://json-schema.org/draft-${options.format}/schema#`;
        }

        // Apply required fields
        if (options.required && Array.isArray(options.required)) {
            schema.required = options.required;
        }

        // Apply additional properties setting
        if (typeof options.additionalProperties === 'boolean') {
            schema.additionalProperties = options.additionalProperties;
        }

        // Apply property-specific customizations
        if (options.properties) {
            Object.entries(options.properties).forEach(([prop, customizations]: [string, any]) => {
                if (schema.properties[prop]) {
                    Object.assign(schema.properties[prop], customizations);
                }
            });
        }
    }

    private async validateSchema(schema: JSONSchema): Promise<void> {
        // TODO: Implement schema validation
        // This could include:
        // 1. Syntax validation
        // 2. Semantic validation
        // 3. Best practices validation
        return Promise.resolve();
    }
}
