import { Tokenizer, TokenizerConfig } from '../../../src/vision/core/tokenizer';
import * as path from 'path';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;
  const modelPath = path.join(__dirname, '../../../models/smolvlm-v1/tokenizer.model');

  beforeEach(() => {
    const config: TokenizerConfig = {
      modelPath,
      maxLength: 512,
      padToken: '[PAD]',
      bosToken: '[BOS]',
      eosToken: '[EOS]'
    };
    tokenizer = new Tokenizer(config);
  });

  describe('Initialization', () => {
    it('should load tokenizer model successfully', async () => {
      await expect(tokenizer.load()).resolves.not.toThrow();
    });

    it('should throw error for invalid model path', async () => {
      const invalidTokenizer = new Tokenizer({
        modelPath: 'invalid/path/tokenizer.model'
      });
      await expect(invalidTokenizer.load()).rejects.toThrow();
    });
  });

  describe('Text Encoding', () => {
    beforeEach(async () => {
      await tokenizer.load();
    });

    it('should encode text correctly', () => {
      const text = 'Hello world';
      const tokens = tokenizer.encode(text);

      expect(tokens).toBeDefined();
      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBe(512); // maxLength
    });

    it('should handle empty text', () => {
      const tokens = tokenizer.encode('');
      expect(tokens).toBeDefined();
      expect(tokens.length).toBe(512); // maxLength with padding
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(1000);
      const tokens = tokenizer.encode(longText);
      expect(tokens.length).toBe(512);
    });
  });

  describe('Token Decoding', () => {
    beforeEach(async () => {
      await tokenizer.load();
    });

    it('should decode tokens correctly', () => {
      const text = 'Hello world';
      const tokens = tokenizer.encode(text);
      const decoded = tokenizer.decode(tokens);

      expect(decoded).toBe(text);
    });

    it('should handle empty token array', () => {
      const decoded = tokenizer.decode([]);
      expect(decoded).toBe('');
    });

    it('should remove special tokens during decoding', () => {
      const text = 'Test text';
      const tokens = tokenizer.encode(text);
      const decoded = tokenizer.decode(tokens);

      expect(decoded).not.toContain('[PAD]');
      expect(decoded).not.toContain('[BOS]');
      expect(decoded).not.toContain('[EOS]');
    });
  });

  describe('Async Operations', () => {
    beforeEach(async () => {
      await tokenizer.load();
    });

    it('should encode text asynchronously', async () => {
      const text = 'Hello world';
      const tokens = await tokenizer.encodeAsync(text);

      expect(tokens).toBeDefined();
      expect(Array.isArray(tokens)).toBe(true);
    });

    it('should decode tokens asynchronously', async () => {
      const text = 'Hello world';
      const tokens = await tokenizer.encodeAsync(text);
      const decoded = await tokenizer.decodeAsync(tokens);

      expect(decoded).toBe(text);
    });
  });

  describe('Special Token Operations', () => {
    beforeEach(async () => {
      await tokenizer.load();
    });

    it('should return valid pad token id', () => {
      const padId = tokenizer.getPadTokenId();
      expect(typeof padId).toBe('number');
    });

    it('should return valid bos token id', () => {
      const bosId = tokenizer.getBosTokenId();
      expect(typeof bosId).toBe('number');
    });

    it('should return valid eos token id', () => {
      const eosId = tokenizer.getEosTokenId();
      expect(typeof eosId).toBe('number');
    });

    it('should return valid vocab size', () => {
      const vocabSize = tokenizer.getVocabSize();
      expect(typeof vocabSize).toBe('number');
      expect(vocabSize).toBeGreaterThan(0);
    });
  });
});
