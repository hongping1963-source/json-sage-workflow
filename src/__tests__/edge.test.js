const { JsonSage } = require('../index');
const fs = require('fs');
const path = require('path');

describe('JsonSage Edge Cases', () => {
    let jsonsage;
    const testDir = path.join(__dirname, 'test-files');
    const testFile = path.join(testDir, 'test.json');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    beforeEach(() => {
        jsonsage = new JsonSage({
            watch: true,
            autoProcess: true
        });
    });

    afterEach(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('File System Edge Cases', () => {
        it('should handle file permission changes', async () => {
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            // 尝试更改文件权限
            try {
                fs.chmodSync(testFile, 0o444); // 只读
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 尝试写入只读文件
                fs.writeFileSync(testFile, JSON.stringify({ test: 'new value' }));
            } catch (error) {
                expect(error).toBeDefined();
            } finally {
                fs.chmodSync(testFile, 0o666); // 恢复权限
            }
        });

        it('should handle file deletion during watch', async () => {
            fs.writeFileSync(testFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));

            fs.unlinkSync(testFile);
            await new Promise(resolve => setTimeout(resolve, 100));

            // 重新创建文件
            fs.writeFileSync(testFile, JSON.stringify({ test: 'new value' }));
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should handle directory deletion during watch', async () => {
            const subDir = path.join(testDir, 'subdir');
            fs.mkdirSync(subDir, { recursive: true });
            
            const instance = new JsonSage({
                watch: true,
                watchPath: subDir
            });

            await new Promise(resolve => setTimeout(resolve, 100));
            fs.rmdirSync(subDir);
            await new Promise(resolve => setTimeout(resolve, 100));
        });
    });

    describe('Content Edge Cases', () => {
        it('should handle empty files', async () => {
            fs.writeFileSync(testFile, '');
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should handle very large files', async () => {
            const largeObject = {
                array: Array(10000).fill('test'),
                nested: Array(1000).fill({ test: 'value' })
            };
            fs.writeFileSync(testFile, JSON.stringify(largeObject));
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should handle special characters in filenames', async () => {
            const specialFile = path.join(testDir, 'test!@#$%^&*().json');
            fs.writeFileSync(specialFile, JSON.stringify({ test: 'value' }));
            await new Promise(resolve => setTimeout(resolve, 100));
            fs.unlinkSync(specialFile);
        });
    });

    describe('Configuration Edge Cases', () => {
        it('should handle invalid watch paths', () => {
            const instance = new JsonSage({
                watch: true,
                watchPath: '/path/that/does/not/exist'
            });
            expect(instance.isWatching()).toBe(false);
        });

        it('should handle invalid file patterns', () => {
            const instance = new JsonSage({
                watch: true,
                filePattern: '**/*.invalid'
            });
            expect(instance.isWatching()).toBe(true);
        });

        it('should handle configuration changes at runtime', async () => {
            const instance = new JsonSage({ watch: false });
            expect(instance.isWatching()).toBe(false);

            instance.updateConfig({ watch: true });
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(instance.isWatching()).toBe(true);
        });
    });

    describe('Process Edge Cases', () => {
        it('should handle rapid start/stop cycles', async () => {
            const instance = new JsonSage({ watch: true });
            
            for (let i = 0; i < 5; i++) {
                await instance.start();
                await instance.stop();
            }
            
            expect(instance.isWatching()).toBe(false);
        });

        it('should handle concurrent file operations', async () => {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    fs.promises.writeFile(
                        testFile,
                        JSON.stringify({ test: i })
                    )
                );
            }
            await Promise.all(promises);
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should handle process termination signals', async () => {
            const instance = new JsonSage({ watch: true });
            await new Promise(resolve => setTimeout(resolve, 100));

            // 模拟进程终止信号
            process.emit('SIGTERM');
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(instance.isWatching()).toBe(false);
        });
    });

    describe('Memory Edge Cases', () => {
        it('should handle memory pressure', async () => {
            const instance = new JsonSage({
                watch: true,
                memoryLimit: 1024 // 1KB limit
            });

            // 创建大于内存限制的数据
            const largeData = { data: 'x'.repeat(2048) };
            fs.writeFileSync(testFile, JSON.stringify(largeData));
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        it('should handle garbage collection triggers', async () => {
            const instance = new JsonSage({ watch: true });
            
            // 创建多个大对象触发GC
            for (let i = 0; i < 10; i++) {
                const largeData = { data: 'x'.repeat(1000000) };
                fs.writeFileSync(testFile, JSON.stringify(largeData));
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        });
    });
});
