import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export interface DeepSeekConfig {
    apiKey?: string;
    apiBaseUrl?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}

export interface GlobalConfig {
    deepseek?: DeepSeekConfig;
    caching?: boolean;
    cacheTTL?: number;
}

class ConfigManager {
    private static instance: ConfigManager;
    private config: GlobalConfig = {};
    private configPath: string = '';

    private constructor() {
        this.loadEnvConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    /**
     * 初始化配置
     * @param options 配置选项
     */
    public init(options: { configPath?: string } = {}): void {
        if (options.configPath) {
            this.configPath = options.configPath;
            this.loadFileConfig();
        }
    }

    /**
     * 从环境变量加载配置
     */
    private loadEnvConfig(): void {
        // 加载 .env 文件
        dotenv.config();

        this.config.deepseek = {
            apiKey: process.env.JSONSAGE_DEEPSEEK_API_KEY,
            apiBaseUrl: process.env.JSONSAGE_DEEPSEEK_API_BASE_URL,
            model: process.env.JSONSAGE_DEEPSEEK_MODEL,
            maxTokens: process.env.JSONSAGE_DEEPSEEK_MAX_TOKENS ? 
                parseInt(process.env.JSONSAGE_DEEPSEEK_MAX_TOKENS) : undefined,
            temperature: process.env.JSONSAGE_DEEPSEEK_TEMPERATURE ? 
                parseFloat(process.env.JSONSAGE_DEEPSEEK_TEMPERATURE) : undefined
        };

        this.config.caching = process.env.JSONSAGE_ENABLE_CACHE === 'true';
        this.config.cacheTTL = process.env.JSONSAGE_CACHE_TTL ? 
            parseInt(process.env.JSONSAGE_CACHE_TTL) : undefined;
    }

    /**
     * 从配置文件加载配置
     */
    private loadFileConfig(): void {
        if (!this.configPath) return;

        try {
            const configFile = fs.readFileSync(this.configPath, 'utf8');
            const fileConfig = JSON.parse(configFile);
            this.mergeConfig(fileConfig);
        } catch (error) {
            console.warn(`Failed to load config file: ${error.message}`);
        }
    }

    /**
     * 合并配置
     */
    private mergeConfig(newConfig: GlobalConfig): void {
        this.config = {
            ...this.config,
            ...newConfig,
            deepseek: {
                ...this.config.deepseek,
                ...newConfig.deepseek
            }
        };
    }

    /**
     * 更新配置
     */
    public updateConfig(newConfig: GlobalConfig): void {
        this.mergeConfig(newConfig);

        // 如果有配置文件，同时更新文件
        if (this.configPath) {
            try {
                fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            } catch (error) {
                console.error(`Failed to save config file: ${error.message}`);
            }
        }
    }

    /**
     * 获取完整配置
     */
    public getConfig(): GlobalConfig {
        return { ...this.config };
    }

    /**
     * 获取 DeepSeek 配置
     */
    public getDeepSeekConfig(): DeepSeekConfig {
        return { ...this.config.deepseek };
    }

    /**
     * 重置配置
     */
    public reset(): void {
        this.config = {};
        this.loadEnvConfig();
        if (this.configPath) {
            this.loadFileConfig();
        }
    }
}
