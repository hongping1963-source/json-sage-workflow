import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface DeepSeekConfig {
  apiKey?: string;
  apiBaseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface SchemaGenerationOptions {
  includeExamples?: boolean;
  includeDescriptions?: boolean;
  format?: 'json-schema-draft-07' | 'json-schema-draft-04';
}

export class DeepSeekService {
  private readonly config: DeepSeekConfig;

  constructor(config: DeepSeekConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
      apiBaseUrl: config.apiBaseUrl || 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat',
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 4000,
    };

    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key is required. Please set it in the constructor or as DEEPSEEK_API_KEY environment variable.');
    }
  }

  private generatePrompt(json: string, options: SchemaGenerationOptions): string {
    return `Please analyze the following JSON and generate a JSON Schema that validates it.
Requirements:
- Use ${options.format || 'json-schema-draft-07'} format
- ${options.includeDescriptions ? 'Include detailed descriptions for each field' : 'Keep descriptions minimal'}
- ${options.includeExamples ? 'Include examples for each field based on the input' : 'Do not include examples'}
- Infer appropriate types and formats
- Include appropriate required fields

JSON to analyze:
${json}

Please respond with only the JSON Schema, no additional text.`;
  }

  public async generateSchema(json: string, options: SchemaGenerationOptions = {}): Promise<string> {
    try {
      // Validate JSON
      JSON.parse(json);

      const response = await axios.post(
        `${this.config.apiBaseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: this.generatePrompt(json, options),
            },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      const schema = response.data.choices[0].message.content;
      
      // Validate that the response is a valid JSON Schema
      JSON.parse(schema);
      
      return schema;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error(`Failed to generate schema: ${error.message}`);
    }
  }
}
