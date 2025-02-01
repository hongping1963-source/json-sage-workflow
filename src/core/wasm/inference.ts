import * as Comlink from 'comlink';
import { ModelConfig } from '../model/base';

/**
 * WebAssembly推理接口
 */
export interface WasmInferenceInterface {
  initialize(config: ModelConfig): Promise<void>;
  predict(input: Float32Array): Promise<Float32Array>;
  dispose(): Promise<void>;
}

/**
 * WebAssembly推理实现
 */
export class WasmInference implements WasmInferenceInterface {
  private wasmModule: WebAssembly.Module | null = null;
  private wasmInstance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;

  /**
   * 初始化WASM模块
   */
  async initialize(config: ModelConfig): Promise<void> {
    try {
      // 1. 加载WASM模块
      const wasmCode = await this.loadWasmModule(config.modelPath);
      
      // 2. 创建内存
      this.memory = new WebAssembly.Memory({
        initial: 256, // 16MB (256 pages * 64KB)
        maximum: 1024 // 64MB
      });

      // 3. 创建导入对象
      const importObject = {
        env: {
          memory: this.memory,
          abort: () => console.error('Wasm aborted')
        }
      };

      // 4. 实例化模块
      this.wasmModule = await WebAssembly.compile(wasmCode);
      this.wasmInstance = await WebAssembly.instantiate(this.wasmModule, importObject);

    } catch (error) {
      throw new Error(`Failed to initialize WASM: ${error.message}`);
    }
  }

  /**
   * 执行推理
   */
  async predict(input: Float32Array): Promise<Float32Array> {
    if (!this.wasmInstance || !this.memory) {
      throw new Error('WASM not initialized');
    }

    try {
      // 1. 分配输入内存
      const inputPtr = this.allocateMemory(input.byteLength);
      
      // 2. 复制输入数据
      new Float32Array(this.memory.buffer, inputPtr, input.length).set(input);

      // 3. 执行推理
      const outputPtr = (this.wasmInstance.exports.predict as Function)(inputPtr, input.length);
      
      // 4. 获取输出
      const outputSize = (this.wasmInstance.exports.getOutputSize as Function)();
      const output = new Float32Array(this.memory.buffer, outputPtr, outputSize);

      // 5. 复制结果（避免内存被回收）
      const result = new Float32Array(output);

      // 6. 释放内存
      this.freeMemory(inputPtr);
      
      return result;
    } catch (error) {
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    try {
      if (this.wasmInstance) {
        (this.wasmInstance.exports.dispose as Function)?.();
      }
      this.wasmInstance = null;
      this.wasmModule = null;
      this.memory = null;
    } catch (error) {
      throw new Error(`Failed to dispose WASM: ${error.message}`);
    }
  }

  // 私有辅助方法
  private async loadWasmModule(path: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(path);
      return await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Failed to load WASM module: ${error.message}`);
    }
  }

  private allocateMemory(size: number): number {
    if (!this.wasmInstance) {
      throw new Error('WASM not initialized');
    }
    return (this.wasmInstance.exports.allocate as Function)(size);
  }

  private freeMemory(ptr: number): void {
    if (!this.wasmInstance) {
      throw new Error('WASM not initialized');
    }
    (this.wasmInstance.exports.free as Function)(ptr);
  }
}

// 创建Worker包装器
export const createWasmWorker = () => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url));
  return Comlink.wrap<WasmInferenceInterface>(worker);
};
