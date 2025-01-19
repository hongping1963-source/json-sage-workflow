const { JsonSageWorkflow } = require('../core/Workflow');

describe('JsonSageWorkflow', () => {
    let workflow;

    describe('Basic Functionality', () => {
        beforeEach(() => {
            workflow = new JsonSageWorkflow({
                watch: false,
                autoProcess: false,
                generateTypes: false,
                autoOptimize: false,
                compression: false,
                validation: false,
                caching: false
            });
        });

        it('should parse JSON string', () => {
            const testData = { test: 'value' };
            const jsonString = JSON.stringify(testData);
            expect(workflow.parse(jsonString)).toEqual(testData);
        });

        it('should stringify data', () => {
            const testData = { test: 'value' };
            const result = workflow.stringify(testData);
            expect(JSON.parse(result)).toEqual(testData);
        });
    });

    describe('Advanced Features', () => {
        beforeEach(() => {
            workflow = new JsonSageWorkflow({
                watch: true,
                autoProcess: true,
                generateTypes: true,
                autoOptimize: true,
                compression: true,
                validation: true,
                caching: true
            });
        });

        it('should use cache for parsing', async () => {
            const testData = { test: 'value' };
            const jsonString = JSON.stringify(testData);
            
            // First parse should cache
            const firstResult = workflow.parse(jsonString);
            expect(firstResult).toEqual(testData);
            
            // Second parse should use cache
            const secondResult = workflow.parse(jsonString);
            expect(secondResult).toEqual(testData);
        });

        it('should use cache for stringifying', () => {
            const testData = { test: 'value' };
            
            // First stringify should cache
            const firstResult = workflow.stringify(testData);
            
            // Second stringify should use cache
            const secondResult = workflow.stringify(testData);
            expect(firstResult).toBe(secondResult);
        });

        it('should handle compression', () => {
            const testData = { test: 'value'.repeat(100) }; // Large enough to trigger compression
            const jsonString = workflow.stringify(testData);
            const parsed = workflow.parse(jsonString);
            expect(parsed).toEqual(testData);
        });

        it('should validate and repair data', () => {
            const testData = { number: '123' }; // Number as string
            const jsonString = JSON.stringify(testData);
            const result = workflow.parse(jsonString);
            expect(result.number).toBe(123); // Should be converted to number
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            workflow = new JsonSageWorkflow();
        });

        it('should handle invalid JSON', () => {
            expect(() => workflow.parse('invalid json')).toThrow();
        });

        it('should handle circular references', () => {
            const circular = { name: 'test' };
            circular.self = circular;
            expect(() => workflow.stringify(circular)).toThrow();
        });

        it('should handle initialization errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const badWorkflow = new JsonSageWorkflow({
                watch: true,
                autoProcess: true,
                generateTypes: true,
                autoOptimize: true
            });
            
            // Wait for initialization to complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Performance Reporting', () => {
        beforeEach(() => {
            workflow = new JsonSageWorkflow({
                compression: true,
                caching: true
            });
        });

        it('should generate performance report', async () => {
            const report = await workflow.getPerformanceReport();
            
            expect(report).toHaveProperty('cache');
            expect(report).toHaveProperty('compression');
            expect(report.compression).toHaveProperty('enabled', true);
            expect(report.compression).toHaveProperty('analysis');
        });

        it('should include cache statistics', async () => {
            const testData = { test: 'value' };
            workflow.parse(JSON.stringify(testData)); // Add something to cache
            
            const report = await workflow.getPerformanceReport();
            expect(report.cache).toHaveProperty('itemCount');
            expect(report.cache.itemCount).toBeGreaterThan(0);
        });
    });
});
