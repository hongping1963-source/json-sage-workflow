import { readFile } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

interface ProjectInfo {
    type: 'frontend' | 'backend' | 'fullstack';
    framework: string;
    jsonDirectories: string[];
}

export class ProjectAnalyzer {
    async analyzeProject(): Promise<ProjectInfo> {
        const projectInfo: ProjectInfo = {
            type: 'frontend',
            framework: 'unknown',
            jsonDirectories: []
        };

        try {
            // 检测 package.json
            const packageJson = await this.readPackageJson();
            
            // 分析项目类型和框架
            projectInfo.type = this.determineProjectType(packageJson);
            projectInfo.framework = this.detectFramework(packageJson);
            
            // 查找JSON文件目录
            projectInfo.jsonDirectories = await this.findJsonDirectories();

            return projectInfo;
        } catch (error) {
            console.error('Error analyzing project:', error);
            return projectInfo;
        }
    }

    private async readPackageJson() {
        try {
            const content = await readFile('package.json', 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            return {};
        }
    }

    private determineProjectType(packageJson: any): 'frontend' | 'backend' | 'fullstack' {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const hasBackend = deps.express || deps.koa || deps.fastify || deps.nest;
        const hasFrontend = deps.react || deps.vue || deps.angular;

        if (hasBackend && hasFrontend) return 'fullstack';
        if (hasBackend) return 'backend';
        return 'frontend';
    }

    private detectFramework(packageJson: any): string {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        if (deps.react) return 'react';
        if (deps.vue) return 'vue';
        if (deps.angular) return 'angular';
        if (deps.express) return 'express';
        if (deps.nest) return 'nest';
        
        return 'unknown';
    }

    private async findJsonDirectories(): Promise<string[]> {
        const jsonFiles = await glob('**/*.json', {
            ignore: ['node_modules/**', 'dist/**', 'build/**'],
        });

        return [...new Set(jsonFiles.map(file => join(process.cwd(), file)))];
    }
}
