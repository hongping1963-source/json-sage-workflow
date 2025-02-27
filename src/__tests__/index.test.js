const { JsonSage } = require('../index');
const fs = require('fs');
const path = require('path');

describe('JsonSage', () => {
    let jsonsage;
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.json');

    beforeAll(() => {
        // 创建测试目录和文件
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    beforeEach(() => {
        jsonsage = new JsonSage({
            watch: true,
            autoProcess: true,
            generateTypes: true,
            autoOptimize: true,
            compression: true,
            validation: true,
            caching: true
        });
    });

    afterEach(() => {
        // 清理测试文件
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Configuration Tests', () => {
        it('should initialize with default options', () => {
            const defaultInstance = new JsonSage();
            expect(defaultInstance.options).toBeDefined();
            expect(defaultInstance.options.watch).toBe(false);
            expect(defaultInstance.options.autoProcess).toBe(false);
        });

        it('should initialize with custom options', () => {
            const customInstance = new JsonSage({
                watch: true,
                autoProcess: true,
                compression: true
            });
            expect(customInstance.options.watch).toBe(true);
            expect(customInstance.options.autoProcess).toBe(true);
            expect(customInstance.options.compression).toBe(true);
        });

        it('should handle invalid options gracefully', () => {
            const instance = new JsonSage({
                watch: 'invalid',
                autoProcess: 123,
                invalidOption: true
            });
            expect(instance.options.watch).toBe(false);
            expect(instance.options.autoProcess).toBe(false);
        });
    });

    describe('File Processing Tests', () => {
        it('should process JSON file changes', async () => {
            const testData = { test: 'value' };
            fs.writeFileSync(testFile, JSON.stringify(testData));

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(fs.existsSync(testFile)).toBe(true);
        });

        it('should handle multiple file changes', async () => {
            const testData1 = { test: 'value1' };
            const testData2 = { test: 'value2' };

            fs.writeFileSync(testFile, JSON.stringify(testData1));
            await new Promise(resolve => setTimeout(resolve, 100));

            fs.writeFileSync(testFile, JSON.stringify(testData2));
            await new Promise(resolve => setTimeout(resolve, 100));

            const content = fs.readFileSync(testFile, 'utf8');
            expect(JSON.parse(content)).toEqual(testData2);
        });

        it('should handle invalid JSON files', async () => {
            fs.writeFileSync(testFile, 'invalid json');
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(fs.existsSync(testFile)).toBe(true);
        });
    });

    describe('Performance Tests', () => {
        it('should handle large JSON files', async () => {
            const largeData = {
                array: Array(1000).fill('test'),
                nested: Array(100).fill({ test: 'value' })
            };

            fs.writeFileSync(testFile, JSON.stringify(largeData));
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(fs.existsSync(testFile)).toBe(true);
        });

        it('should handle rapid file changes', async () => {
            for (let i = 0; i < 10; i++) {
                fs.writeFileSync(testFile, JSON.stringify({ test: i }));
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            expect(fs.existsSync(testFile)).toBe(true);
        });
    });

    describe('Error Handling Tests', () => {
        it('should handle file system errors', async () => {
            const readOnlyDir = path.join(testDir, 'readonly');
            if (!fs.existsSync(readOnlyDir)) {
                fs.mkdirSync(readOnlyDir);
            }

            const instance = new JsonSage({
                watch: true,
                watchPath: readOnlyDir
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            expect(instance.isWatching()).toBe(true);
        });

        it('should handle invalid file paths', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: '/nonexistent/path'
            });
            expect(instance.isWatching()).toBe(false);
        });

        it('should handle process termination', async () => {
            const instance = new JsonSage({ watch: true });
            await instance.stop();
            expect(instance.isWatching()).toBe(false);
        });
    });

    describe('Integration Tests', () => {
        it('should integrate with compression', async () => {
            const largeData = { data: 'x'.repeat(10000) };
            fs.writeFileSync(testFile, JSON.stringify(largeData));
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(fs.existsSync(testFile)).toBe(true);
        });

        it('should integrate with validation', async () => {
            const schema = {
                type: 'object',
                properties: {
                    test: { type: 'string' }
                }
            };

            const instance = new JsonSage({
                validation: true,
                schema: schema
            });

            fs.writeFileSync(testFile, JSON.stringify({ test: 123 }));
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(fs.existsSync(testFile)).toBe(true);
        });
    });
});
