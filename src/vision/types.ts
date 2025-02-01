export interface VisionConfig {
  modelPath?: string;
  deviceType?: 'cpu' | 'cuda';
  maxTokens?: number;
}

export interface ImageAnalysisResult {
  description: string;
  objects: string[];
  attributes: Record<string, any>;
  confidence?: number;
}

export interface JsonMappingResult {
  imageContent: {
    description: string;
    detectedObjects: string[];
    attributes: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    confidence: number;
    processingDetails?: {
      model: string;
      version: string;
    };
  };
}

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  required?: string[];
  format?: string;
  enum?: any[];
  default?: any;
  description?: string;
  examples?: any[];
}

export interface MappingRule {
  source: string;
  target: string;
  transform?: TransformRule[];
  condition?: ConditionRule;
  default?: any;
}

export interface TransformRule {
  type: 'format' | 'extract' | 'combine' | 'filter' | 'custom';
  params?: Record<string, any>;
  customFunction?: (value: any) => any;
}

export interface ConditionRule {
  type: 'exists' | 'equals' | 'contains' | 'regex' | 'custom';
  value?: any;
  customFunction?: (value: any) => boolean;
}

export interface MappingContext {
  sourceData: any;
  targetSchema?: SchemaDefinition;
  rules?: MappingRule[];
  options?: {
    strictMapping?: boolean;
    preserveNull?: boolean;
    validateSchema?: boolean;
    errorOnMissing?: boolean;
  };
}
