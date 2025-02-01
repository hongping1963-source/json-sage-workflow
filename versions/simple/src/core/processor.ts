import { JsonProcessResult, VisionProcessOptions, VisionProcessResult, Config, JsonSageError } from '../types';
import { SmolVLMProvider } from '../ai/providers/smolvlm';
import { VisionProcessor } from '../ai/vision/processor';
import { Logger } from '../utils/logger';
import { PerformanceMonitor } from '../utils/performance';

export class JsonProcessor {
  private aiProvider: SmolVLMProvider;
  private visionProcessor: VisionProcessor;
  private logger: Logger;
  private performanceMonitor: PerformanceMonitor;

  constructor(config: Config) {
    this.aiProvider = new SmolVLMProvider(
      config.apiKey,
      config.visionOptions?.modelSize,
      config.visionOptions?.maxResolution
    );
    this.visionProcessor = new VisionProcessor(
      this.aiProvider,
      config.visionOptions?.maxResolution
    );
    this.logger = new Logger(config.enableLogging);
    this.performanceMonitor = new PerformanceMonitor();
  }

  async processJson(json: object): Promise<JsonProcessResult> {
    const perfId = this.performanceMonitor.start('processJson');
    try {
      this.logger.info('Starting JSON processing');
      
      // Validate input
      if (!json || typeof json !== 'object') {
        throw new JsonSageError(
          'Invalid JSON input',
          'INVALID_INPUT',
          { receivedType: typeof json }
        );
      }

      // Process with AI provider
      const result = await this.aiProvider.processJson(json);
      
      this.logger.info('JSON processing completed successfully');
      this.performanceMonitor.end(perfId, true);
      
      return result;
    } catch (error) {
      this.logger.error('Error processing JSON', error);
      this.performanceMonitor.end(perfId, false, error);
      throw error;
    }
  }

  async processVision(options: VisionProcessOptions): Promise<VisionProcessResult> {
    const perfId = this.performanceMonitor.start('processVision');
    try {
      this.logger.info('Starting vision processing');
      
      // Validate input
      if (!options.json || !options.image) {
        throw new JsonSageError(
          'Invalid vision processing input',
          'INVALID_INPUT',
          { missingFields: !options.json ? 'json' : 'image' }
        );
      }

      // Process with vision processor
      const result = await this.visionProcessor.processImage(options);
      
      this.logger.info('Vision processing completed successfully');
      this.performanceMonitor.end(perfId, true);
      
      return result;
    } catch (error) {
      this.logger.error('Error processing vision', error);
      this.performanceMonitor.end(perfId, false, error);
      throw error;
    }
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }
}
