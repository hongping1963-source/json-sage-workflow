import type { WorkflowConfig } from './json-sage-workflow';

export class Workflow {
    generateSchema = jest.fn();
    deepseek = {
        generateFieldDescriptions: jest.fn(),
        generateExamples: jest.fn()
    };
}

export const json = {
    createWorkflow: jest.fn((config?: WorkflowConfig): Workflow => new Workflow())
};
