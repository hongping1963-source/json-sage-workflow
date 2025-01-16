import { JsonSageWorkflow } from '../core/Workflow';

describe('JsonSage Integration Tests', () => {
    let workflow: JsonSageWorkflow;
    
    // 测试数据
    const testData = {
        user: {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
            preferences: {
                theme: 'dark',
                notifications: true
            },
            tags: ['developer', 'javascript', 'typescript']
        },
        posts: [
            {
                id: 1,
                title: 'Hello World',
                content: 'This is a test post'.repeat(100), // 创建大文本以测试压缩
                created: '2025-01-12T15:00:00Z'
            },
            {
                id: 2,
                title: 'Second Post',
                content: 'Another test post'.repeat(100),
                created: '2025-01-12T16:00:00Z'
            }
        ]
    };

    beforeEach(() => {
        workflow = new JsonSageWorkflow({
            watch: false, // 测试时禁用文件监控
            autoProcess: true,
            generateTypes: true,
            autoOptimize: true,
            compression: true,
            validation: true,
            caching: true
        });
    });

    describe('Basic Functionality', () => {
        it('should parse and stringify JSON correctly', () => {
            const jsonString = JSON.stringify(testData);
            const parsed = workflow.parse(jsonString);
            const stringified = workflow.stringify(parsed);
            
            expect(parsed).toEqual(testData);
            expect(JSON.parse(stringified)).toEqual(testData);
        });
    });

    describe('Compression', () => {
        it('should compress large JSON data effectively', async () => {
            const largeData = { ...testData };
            // 添加更多数据以测试压缩
            largeData.posts = Array(100).fill(testData.posts[0]);

            const jsonString = JSON.stringify(largeData);
            const compressed = workflow.stringify(largeData);

            // 压缩后的大小应该小于原始大小
            expect(compressed.length).toBeLessThan(jsonString.length);

            // 解压后应该与原始数据相同
            const decompressed = workflow.parse(compressed);
            expect(decompressed).toEqual(largeData);
        });
    });

    describe('Validation and Repair', () => {
        it('should validate and repair invalid data', () => {
            const invalidData = {
                user: {
                    name: 123, // 应该是字符串
                    age: '30', // 应该是数字
                    email: 'invalid-email', // 无效的邮箱格式
                }
            };

            const jsonString = JSON.stringify(invalidData);
            const repaired = workflow.parse(jsonString);

            // 验证修复结果
            expect(typeof repaired.user.name).toBe('string');
            expect(typeof repaired.user.age).toBe('number');
            expect(repaired.user.email).toBe(''); // 无效邮箱应被清空
        });
    });

    describe('Caching', () => {
        it('should cache and retrieve results efficiently', () => {
            const jsonString = JSON.stringify(testData);

            // 第一次解析（未缓存）
            console.time('first-parse');
            const firstParse = workflow.parse(jsonString);
            console.timeEnd('first-parse');

            // 第二次解析（应该使用缓存）
            console.time('second-parse');
            const secondParse = workflow.parse(jsonString);
            console.timeEnd('second-parse');

            // 验证结果一致性
            expect(firstParse).toEqual(secondParse);
            
            // 获取性能报告
            return workflow.getPerformanceReport().then(report => {
                expect(report.cache.cacheHits).toBeGreaterThan(0);
            });
        });
    });

    describe('Performance Reporting', () => {
        it('should generate comprehensive performance reports', async () => {
            // 执行一些操作来生成性能数据
            const jsonString = JSON.stringify(testData);
            workflow.parse(jsonString);
            workflow.stringify(testData);

            const report = await workflow.getPerformanceReport();

            // 验证报告结构
            expect(report).toHaveProperty('cache');
            expect(report).toHaveProperty('compression');
            expect(report.cache).toHaveProperty('totalSize');
            expect(report.cache).toHaveProperty('itemCount');
            expect(report.cache).toHaveProperty('utilization');
        });
    });
});
