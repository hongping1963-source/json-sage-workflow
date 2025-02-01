import * as Benchmark from 'benchmark';
import { SmolVLM } from '../../src/core/model/smolvlm';
import { ModelLoader } from '../../src/core/model/loader';
import { ModelProcessor } from '../../src/core/model/processor';
import { ModelOptimizer } from '../../src/core/optimization/optimizer';
import * as fs from 'fs/promises';
import * as path from 'path';

async function runBenchmarks() {
  const suite = new Benchmark.Suite;
  
  // 初始化测试数据
  const testModelPath = path.join(__dirname, '../fixtures/test-model.onnx');
  const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
  const imageData = await fs.readFile(testImagePath);

  // 初始化模型
  const model = new SmolVLM({
    modelPath: testModelPath,
    deviceType: 'cpu'
  });
  await model.load();

  // 模型加载基准测试
  suite.add('Model Loading', {
    defer: true,
    fn: async (deferred: any) => {
      const loader = new ModelLoader();
      await loader.load(testModelPath);
      deferred.resolve();
    }
  });

  // 图像预处理基准测试
  suite.add('Image Preprocessing', {
    defer: true,
    fn: async (deferred: any) => {
      const processor = new ModelProcessor();
      await processor.preprocess(imageData);
      deferred.resolve();
    }
  });

  // 模型推理基准测试
  suite.add('Model Inference', {
    defer: true,
    fn: async (deferred: any) => {
      await model.predict(imageData);
      deferred.resolve();
    }
  });

  // 批量推理基准测试
  suite.add('Batch Inference (size=4)', {
    defer: true,
    fn: async (deferred: any) => {
      const batch = Array(4).fill(imageData);
      await Promise.all(batch.map(img => model.predict(img)));
      deferred.resolve();
    }
  });

  // 模型优化基准测试
  suite.add('Model Optimization', {
    defer: true,
    fn: async (deferred: any) => {
      const optimizer = new ModelOptimizer();
      await optimizer.optimize(model, {
        quantization: { type: 'int8' },
        pruning: { threshold: 0.1 }
      });
      deferred.resolve();
    }
  });

  // 内存使用基准测试
  let memoryUsage = 0;
  suite.add('Memory Usage', {
    defer: true,
    fn: async (deferred: any) => {
      const initialMemory = process.memoryUsage().heapUsed;
      await model.predict(imageData);
      const finalMemory = process.memoryUsage().heapUsed;
      memoryUsage = finalMemory - initialMemory;
      deferred.resolve();
    }
  });

  // 运行基准测试
  suite
    .on('cycle', (event: any) => {
      console.log(String(event.target));
      if (event.target.name === 'Memory Usage') {
        console.log(`Memory Usage: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
      }
    })
    .on('complete', function(this: any) {
      console.log('Fastest test is ' + this.filter('fastest').map('name'));
      
      // 将结果写入文件
      const results = Array.from(this).map((benchmark: any) => ({
        name: benchmark.name,
        hz: benchmark.hz,
        stats: {
          deviation: benchmark.stats.deviation,
          mean: benchmark.stats.mean,
          moe: benchmark.stats.moe,
          rme: benchmark.stats.rme,
          sem: benchmark.stats.sem,
          variance: benchmark.stats.variance
        }
      }));

      fs.writeFile(
        'benchmark-results.json',
        JSON.stringify(results, null, 2)
      ).catch(console.error);
    })
    .run({ async: true });
}

runBenchmarks().catch(console.error);
