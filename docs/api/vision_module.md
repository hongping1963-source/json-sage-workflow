# Vision Module API 文档

## 目录
- [类](#类)
  - [VisionProcessor](#visionprocessor)
  - [SmolVLM](#smolvlm)
  - [ImageProcessor](#imageprocessor)
  - [Tokenizer](#tokenizer)
- [接口](#接口)
  - [配置接口](#配置接口)
  - [映射规则](#映射规则)
  - [分析结果](#分析结果)
- [类型定义](#类型定义)
- [错误处理](#错误处理)

## 类

### VisionProcessor

主要接口类，用于处理图像分析和JSON映射。

#### 构造函数
```typescript
constructor(config: VisionConfig)
```

参数：
- `config`: VisionConfig - 配置对象
  - `modelPath`: string - 模型路径
  - `deviceType`: 'cpu' | 'cuda' - 运行设备
  - `maxTokens`: number - 最大token数量

#### 方法

##### initialize
```typescript
async initialize(): Promise<void>
```
初始化处理器，加载模型和tokenizer。

##### analyzeImage
```typescript
async analyzeImage(imageData: Buffer): Promise<ImageAnalysisResult>
```
分析图像，生成描述和检测对象。

参数：
- `imageData`: Buffer - 图像数据

返回：
- `Promise<ImageAnalysisResult>` - 分析结果

##### generateJsonMapping
```typescript
async generateJsonMapping(
  imageAnalysis: ImageAnalysisResult,
  schema?: SchemaDefinition,
  customRules?: MappingRule[]
): Promise<Record<string, any>>
```

生成JSON映射。

参数：
- `imageAnalysis`: ImageAnalysisResult - 图像分析结果
- `schema`: SchemaDefinition - 可选，输出schema
- `customRules`: MappingRule[] - 可选，自定义映射规则

返回：
- `Promise<Record<string, any>>` - 映射结果

### SmolVLM

视觉AI模型封装类。

#### 构造函数
```typescript
constructor(config: VisionConfig)
```

#### 方法

##### load
```typescript
async load(): Promise<void>
```
加载ONNX模型和tokenizer。

##### generateEmbeddings
```typescript
async generateEmbeddings(imageData: Buffer): Promise<Float32Array>
```
生成图像嵌入。

##### analyze
```typescript
async analyze(imageData: Buffer): Promise<{
  description: string;
  objects: string[];
  attributes: Record<string, any>;
}>
```
分析图像内容。

### ImageProcessor

图像处理工具类。

#### 静态方法

##### validateImage
```typescript
static async validateImage(imageData: Buffer): Promise<boolean>
```
验证图像格式和内容。

##### preprocessImage
```typescript
static async preprocessImage(
  imageData: Buffer,
  options: PreprocessOptions
): Promise<Float32Array>
```
预处理图像。

##### getImageMetadata
```typescript
static async getImageMetadata(
  imageData: Buffer
): Promise<ImageMetadata>
```
获取图像元数据。

##### extractDominantColors
```typescript
static async extractDominantColors(
  imageData: Buffer,
  count: number = 5
): Promise<string[]>
```
提取主要颜色。

### Tokenizer

文本tokenization工具类。

#### 构造函数
```typescript
constructor(config: TokenizerConfig)
```

#### 方法

##### load
```typescript
async load(): Promise<void>
```
加载tokenizer模型。

##### encode
```typescript
async encode(text: string): Promise<number[]>
```
将文本编码为token。

##### decode
```typescript
async decode(tokens: number[]): Promise<string>
```
将token解码为文本。

## 接口

### 配置接口

#### VisionConfig
```typescript
interface VisionConfig {
  modelPath: string;
  deviceType?: 'cpu' | 'cuda';
  maxTokens?: number;
}
```

#### TokenizerConfig
```typescript
interface TokenizerConfig {
  modelPath: string;
  maxLength?: number;
}
```

#### PreprocessOptions
```typescript
interface PreprocessOptions {
  width: number;
  height: number;
  normalize?: boolean;
  channels?: number;
}
```

### 映射规则

#### MappingRule
```typescript
interface MappingRule {
  source: string;
  target: string;
  transform?: TransformRule[];
  condition?: ConditionRule;
  default?: any;
}
```

#### TransformRule
```typescript
interface TransformRule {
  type: 'format' | 'extract' | 'combine' | 'filter' | 'custom';
  params?: Record<string, any>;
  customFunction?: (value: any) => any;
}
```

#### ConditionRule
```typescript
interface ConditionRule {
  type: 'exists' | 'equals' | 'contains' | 'regex' | 'custom';
  value?: any;
  customFunction?: (value: any) => boolean;
}
```

### 分析结果

#### ImageAnalysisResult
```typescript
interface ImageAnalysisResult {
  description: string;
  objects: string[];
  attributes: {
    dimensions: {
      width: number;
      height: number;
    };
    format: string;
    colorSpace: string;
    dominantColors: string[];
    hasAlpha: boolean;
    isAnimated: boolean;
  };
}
```

## 类型定义

### SchemaDefinition
```typescript
type SchemaDefinition = {
  type: string;
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  required?: string[];
};
```

### ImageMetadata
```typescript
interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  space: string;
  channels: number;
  hasAlpha: boolean;
  pages?: number;
}
```

## 错误处理

### VisionError
```typescript
class VisionError extends Error {
  constructor(message: string, code: string);
}
```

错误代码：
- `INVALID_IMAGE`: 无效的图像格式或内容
- `MODEL_LOAD_ERROR`: 模型加载失败
- `TOKENIZER_ERROR`: tokenizer错误
- `PROCESSING_ERROR`: 处理过程错误
- `MAPPING_ERROR`: 映射规则错误
- `VALIDATION_ERROR`: schema验证错误
