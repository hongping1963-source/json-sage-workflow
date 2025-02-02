import { NLUResult } from '../types';
import { DeepSeekAPI } from '../core/DeepSeekAPI';

export class NLUParser {
    private deepseekApi: DeepSeekAPI;

    constructor(apiKey: string) {
        this.deepseekApi = new DeepSeekAPI(apiKey);
    }

    async parse(input: string): Promise<NLUResult> {
        if (!input) {
            throw new Error('Input cannot be empty');
        }

        try {
            // 调用 DeepSeek AI API 进行自然语言处理
            const prompt = `分析以下用户输入，提取意图和实体信息：\n${input}\n\n请以JSON格式返回：
            {
                "intent": "生成意图，如generate_schema, update_schema, add_field等",
                "entity": "涉及的实体，如user, product等",
                "fields": [
                    {
                        "name": "字段名称",
                        "type": "字段类型",
                        "format": "可选的格式说明"
                    }
                ]
            }`;

            const response = await this.deepseekApi.complete(prompt);
            const result = JSON.parse(response);

            // 验证返回结果格式
            if (!result.intent || !result.entity) {
                throw new Error('Invalid response format from DeepSeek AI');
            }

            return result as NLUResult;
        } catch (error) {
            console.error('Error parsing input with DeepSeek AI:', error);
            throw new Error(`Failed to parse input: ${error.message}`);
        }
    }
}
