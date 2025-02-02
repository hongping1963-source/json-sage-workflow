import * as fs from 'fs';
import * as path from 'path';
import * as SentencePiece from 'sentencepiece-js';

export interface TokenizerConfig {
  modelPath: string;
  maxLength?: number;
  padToken?: string;
  bosToken?: string;
  eosToken?: string;
}

export class Tokenizer {
  private tokenizer: any;
  private config: Required<TokenizerConfig>;

  constructor(config: TokenizerConfig) {
    this.config = {
      modelPath: config.modelPath,
      maxLength: config.maxLength || 512,
      padToken: config.padToken || '[PAD]',
      bosToken: config.bosToken || '[BOS]',
      eosToken: config.eosToken || '[EOS]'
    };
  }

  async load(): Promise<void> {
    try {
      // 确保模型文件存在
      const modelPath = path.resolve(this.config.modelPath);
      if (!fs.existsSync(modelPath)) {
        throw new Error(`Tokenizer model not found at ${modelPath}`);
      }

      // 加载SentencePiece模型
      this.tokenizer = await SentencePiece.load(modelPath);
      console.log('Tokenizer loaded successfully');
    } catch (error) {
      console.error('Error loading tokenizer:', error);
      throw error;
    }
  }

  encode(text: string): number[] {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not loaded');
    }

    try {
      // 添加特殊token
      const processedText = `${this.config.bosToken}${text}${this.config.eosToken}`;
      
      // 编码文本
      const tokens = this.tokenizer.encode(processedText);

      // 处理长度限制
      if (tokens.length > this.config.maxLength) {
        return tokens.slice(0, this.config.maxLength);
      }

      // 填充到最大长度
      while (tokens.length < this.config.maxLength) {
        tokens.push(this.tokenizer.encode(this.config.padToken)[0]);
      }

      return tokens;
    } catch (error) {
      console.error('Error encoding text:', error);
      throw error;
    }
  }

  decode(tokens: number[]): string {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not loaded');
    }

    try {
      // 解码token
      const text = this.tokenizer.decode(tokens);

      // 移除特殊token
      return text
        .replace(this.config.bosToken, '')
        .replace(this.config.eosToken, '')
        .replace(new RegExp(this.config.padToken, 'g'), '')
        .trim();
    } catch (error) {
      console.error('Error decoding tokens:', error);
      throw error;
    }
  }

  async encodeAsync(text: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        const tokens = this.encode(text);
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });
  }

  async decodeAsync(tokens: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const text = this.decode(tokens);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });
  }

  getVocabSize(): number {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not loaded');
    }
    return this.tokenizer.vocabSize();
  }

  getPadTokenId(): number {
    return this.tokenizer.encode(this.config.padToken)[0];
  }

  getBosTokenId(): number {
    return this.tokenizer.encode(this.config.bosToken)[0];
  }

  getEosTokenId(): number {
    return this.tokenizer.encode(this.config.eosToken)[0];
  }
}
