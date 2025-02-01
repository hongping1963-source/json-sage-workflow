import { json, JsonSageWorkflow } from '../index';

describe('JsonSage Main API', () => {
    describe('Simple API', () => {
        it('should parse JSON string', () => {
            const testData = { test: 'value' };
            const jsonString = JSON.stringify(testData);
            expect(json.parse(jsonString)).toEqual(testData);
        });

        it('should stringify data', () => {
            const testData = { test: 'value' };
            expect(JSON.parse(json.stringify(testData))).toEqual(testData);
        });

        it('should get performance report', () => {
            const report = json.getPerformanceReport();
            expect(report).toBeDefined();
            expect(report).toHaveProperty('parseTime');
            expect(report).toHaveProperty('stringifyTime');
        });

        it('should handle invalid JSON', () => {
            expect(() => json.parse('invalid json')).toThrow();
        });

        it('should handle circular references', () => {
            const circular: any = { name: 'test' };
            circular.self = circular;
            expect(() => json.stringify(circular)).toThrow();
        });
    });

    describe('Advanced API', () => {
        it('should export JsonSageWorkflow', () => {
            expect(JsonSageWorkflow).toBeDefined();
            const workflow = new JsonSageWorkflow();
            expect(workflow).toBeInstanceOf(JsonSageWorkflow);
        });

        it('should allow custom workflow configuration', () => {
            const workflow = new JsonSageWorkflow({
                compression: true,
                validation: true,
                caching: true
            });
            
            const testData = { test: 'value' };
            const processed = workflow.parse(JSON.stringify(testData));
            expect(processed).toEqual(testData);
        });
    });
});
