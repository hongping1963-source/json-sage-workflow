import { SmolVLM } from '../../../src/core/model/smolvlm';
import { ModelConfig } from '../../../src/core/model/base';
import { OptimizationConfig } from '../../../src/core/optimization/optimizer';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

describe('SmolVLM Performance Benchmarks', () => {
  let model: SmolVLM;
  const testModelPath = path.join(__dirname, '../../fixtures/test-model.onnx');
  const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');
  const benchmarkIterations = 100;

  beforeAll(async () => {
    // 创建测试目录和文件
    await fs.mkdir(path.join(__dirname, '../../fixtures'), { recursive: true });
    
    // 创建测试图像
    const image = sharp({
      create: {
        width: 224,
        height: 224,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    });
    await image.toFile(testImagePath);
  });

  beforeEach(async () => {
    const config: ModelConfig = {
      modelPath: testModelPath,
      deviceType: 'cpu',
      quantization: 'none',
      memoryLimit: 512 * 1024 * 1024
    };
    model = new SmolVLM(config);
  });

  afterEach(async () => {
    await model.dispose();
  });

  /**
   * 测量函数执行时间
   */
  async function measureExecutionTime(
    fn: () => Promise<any>,
    iterations: number = 1
  ): Promise<{ mean: number; std: number; min: number; max: number }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const duration = performance.now() - start;
      times.push(duration);
    }

    // 计算统计数据
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / times.length;
    const std = Math.sqrt(variance);
    const min = Math.min(...times);
    const max = Math.max(...times);

    return { mean, std, min, max };
  }

  /**
   * 测量内存使用
   */
  function measureMemoryUsage(): { heapUsed: number; heapTotal: number } {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024 // MB
    };
  }

  describe('Inference Performance', () => {
    it('should maintain consistent inference speed', async () => {
      await model.load();
      const imageData = await fs.readFile(testImagePath);

      const results = await measureExecutionTime(
        async () => await model.predict(imageData),
        benchmarkIterations
      );

      // 检查性能指标
      expect(results.mean).toBeLessThan(100); // 平均推理时间应小于100ms
      expect(results.std / results.mean).toBeLessThan(0.2); // 变异系数应小于20%
      
      console.log('Inference Performance:', results);
    });

    it('should handle batch processing efficiently', async () => {
      await model.load();
      const imageData = await fs.readFile(testImagePath);
      const batchSizes = [1, 4, 8, 16];

      for (const batchSize of batchSizes) {
        const batch = Array(batchSize).fill(imageData);
        
        const results = await measureExecutionTime(
          async () => {
            for (const input of batch) {
              await model.predict(input);
            }
          },
          5
        );

        console.log(`Batch Size ${batchSize} Performance:`, results);
        expect(results.mean / batchSize).toBeLessThan(100); // 每张图像平均时间应小于100ms
      }
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage during inference', async () => {
      await model.load();
      const imageData = await fs.readFile(testImagePath);
      const initialMemory = measureMemoryUsage();

      // 连续执行多次推理
      for (let i = 0; i < benchmarkIterations; i++) {
        await model.predict(imageData);
        
        if (i % 10 === 0) { // 每10次检查一次内存
          const currentMemory = measureMemoryUsage();
          const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
          
          // 检查内存增长是否在合理范围内
          expect(memoryGrowth).toBeLessThan(50); // 内存增长应小于50MB
        }
      }
    });

    it('should properly release memory after disposal', async () => {
      await model.load();
      const beforeLoad = measureMemoryUsage();
      
      // 执行一些操作
      const imageData = await fs.readFile(testImagePath);
      await model.predict(imageData);
      
      const afterUse = measureMemoryUsage();
      await model.dispose();
      
      // 强制垃圾回收
      if (global.gc) {
        global.gc();
      }
      
      const afterDispose = measureMemoryUsage();
      
      // 检查内存释放
      expect(afterDispose.heapUsed).toBeLessThan(afterUse.heapUsed);
      expect(afterDispose.heapUsed - beforeLoad.heapUsed).toBeLessThan(10); // 剩余内存增长应小于10MB
    });
  });

  describe('Optimization Impact', () => {
    it('should measure performance improvement after quantization', async () => {
      // 1. 测试原始模型性能
      await model.load();
      const imageData = await fs.readFile(testImagePath);
      const originalResults = await measureExecutionTime(
        async () => await model.predict(imageData),
        benchmarkIterations
      );

      // 2. 测试量化后的模型性能
      const quantizedConfig: ModelConfig = {
        ...model.getConfig(),
        quantization: 'int8'
      };
      const quantizedModel = new SmolVLM(quantizedConfig);
      await quantizedModel.load();

      const quantizedResults = await measureExecutionTime(
        async () => await quantizedModel.predict(imageData),
        benchmarkIterations
      );

      // 3. 比较性能
      const speedup = originalResults.mean / quantizedResults.mean;
      console.log('Quantization Speedup:', speedup);
      expect(speedup).toBeGreaterThan(1.2); // 期望至少20%的性能提升

      await quantizedModel.dispose();
    });

    it('should measure memory reduction after optimization', async () => {
      // 1. 测试原始模型内存
      await model.load();
      const originalMemory = measureMemoryUsage();

      // 2. 测试优化后的模型内存
      const optimizationConfig: OptimizationConfig = {
        quantization: { type: 'int8' },
        pruning: { threshold: 0.1, method: 'magnitude' }
      };
      
      const optimizedConfig: ModelConfig = {
        ...model.getConfig(),
        optimization: optimizationConfig
      };
      
      const optimizedModel = new SmolVLM(optimizedConfig);
      await optimizedModel.load();
      const optimizedMemory = measureMemoryUsage();

      // 3. 比较内存使用
      const memoryReduction = (originalMemory.heapUsed - optimizedMemory.heapUsed) / originalMemory.heapUsed;
      console.log('Memory Reduction:', memoryReduction);
      expect(memoryReduction).toBeGreaterThan(0.3); // 期望至少30%的内存减少

      await optimizedModel.dispose();
    });
  });

  describe('Edge Device Simulation', () => {
    it('should perform well under memory constraints', async () => {
      const constrainedConfig: ModelConfig = {
        ...model.getConfig(),
        memoryLimit: 128 * 1024 * 1024 // 128MB限制
      };
      
      const constrainedModel = new SmolVLM(constrainedConfig);
      await constrainedModel.load();

      const imageData = await fs.readFile(testImagePath);
      const results = await measureExecutionTime(
        async () => await constrainedModel.predict(imageData),
        benchmarkIterations
      );

      // 检查在内存限制下的性能
      expect(results.mean).toBeLessThan(200); // 在内存限制下，允许稍慢的推理时间
      expect(measureMemoryUsage().heapUsed).toBeLessThan(128); // 确保内存使用在限制内

      await constrainedModel.dispose();
    });

    it('should handle concurrent requests efficiently', async () => {
      await model.load();
      const imageData = await fs.readFile(testImagePath);
      const concurrentRequests = 5;

      const start = performance.now();
      
      // 并发执行多个请求
      const promises = Array(concurrentRequests)
        .fill(null)
        .map(() => model.predict(imageData));
      
      await Promise.all(promises);
      
      const duration = performance.now() - start;
      const averageTime = duration / concurrentRequests;

      console.log('Concurrent Processing Time:', {
        total: duration,
        average: averageTime
      });

      // 检查并发性能
      expect(averageTime).toBeLessThan(150); // 平均处理时间应小于150ms
    });
  });
});
