import { watch } from 'fs';
import { join } from 'path';
import { analyzeJsonStructure } from './analyzer';
import { generateTypeDefinitions } from './typeGenerator';

export class JsonSageAutoDetector {
    private watchPaths: Set<string> = new Set();
    private typeCache: Map<string, any> = new Map();

    constructor(private options = { generateTypes: true }) {}

    public watchDirectories(directories: string[]) {
        directories.forEach(dir => {
            if (!this.watchPaths.has(dir)) {
                this.watchPaths.add(dir);
                this.initializeWatcher(dir);
            }
        });
    }

    private initializeWatcher(directory: string) {
        watch(directory, { recursive: true }, async (eventType, filename) => {
            if (filename && filename.endsWith('.json')) {
                const fullPath = join(directory, filename);
                await this.processJsonFile(fullPath);
            }
        });
    }

    private async processJsonFile(filePath: string) {
        try {
            // 分析JSON结构
            const structure = await analyzeJsonStructure(filePath);
            
            // 生成类型定义
            if (this.options.generateTypes) {
                const typeDefinition = await generateTypeDefinitions(structure);
                this.typeCache.set(filePath, typeDefinition);
                
                // 自动生成.d.ts文件
                const typePath = filePath.replace('.json', '.d.ts');
                await this.writeTypeDefinition(typePath, typeDefinition);
            }
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }

    private async writeTypeDefinition(path: string, content: string) {
        // 实现类型定义文件的写入逻辑
    }

    public getTypeDefinition(filePath: string) {
        return this.typeCache.get(filePath);
    }
}
