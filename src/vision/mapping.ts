import {
  MappingContext,
  MappingRule,
  SchemaDefinition,
  TransformRule,
  ConditionRule
} from './types';

export class MappingProcessor {
  private validateSchema(data: any, schema: SchemaDefinition): boolean {
    if (!schema) return true;

    switch (schema.type) {
      case 'object':
        if (typeof data !== 'object' || data === null) return false;
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (schema.required?.includes(key) && !(key in data)) return false;
            if (key in data && !this.validateSchema(data[key], propSchema)) {
              return false;
            }
          }
        }
        return true;

      case 'array':
        if (!Array.isArray(data)) return false;
        if (schema.items) {
          return data.every(item => this.validateSchema(item, schema.items!));
        }
        return true;

      case 'string':
        return typeof data === 'string';

      case 'number':
        return typeof data === 'number';

      case 'boolean':
        return typeof data === 'boolean';

      case 'null':
        return data === null;

      default:
        return true;
    }
  }

  private applyTransform(value: any, rules: TransformRule[]): any {
    return rules.reduce((result, rule) => {
      switch (rule.type) {
        case 'format':
          if (rule.params?.dateFormat && result instanceof Date) {
            return result.toLocaleString();
          }
          return result;

        case 'extract':
          if (Array.isArray(result) && typeof rule.params?.index === 'number') {
            return result[rule.params.index];
          }
          if (typeof result === 'object' && rule.params?.key) {
            return result[rule.params.key];
          }
          return result;

        case 'combine':
          if (Array.isArray(result) && rule.params?.separator) {
            return result.join(rule.params.separator);
          }
          return result;

        case 'filter':
          if (Array.isArray(result) && rule.params?.predicate) {
            return result.filter(item => rule.params!.predicate(item));
          }
          return result;

        case 'custom':
          if (rule.customFunction) {
            return rule.customFunction(result);
          }
          return result;

        default:
          return result;
      }
    }, value);
  }

  private evaluateCondition(value: any, condition: ConditionRule): boolean {
    switch (condition.type) {
      case 'exists':
        return value !== undefined && value !== null;

      case 'equals':
        return value === condition.value;

      case 'contains':
        if (Array.isArray(value)) {
          return value.includes(condition.value);
        }
        if (typeof value === 'string') {
          return value.includes(String(condition.value));
        }
        return false;

      case 'regex':
        if (typeof value === 'string' && condition.value instanceof RegExp) {
          return condition.value.test(value);
        }
        return false;

      case 'custom':
        if (condition.customFunction) {
          return condition.customFunction(value);
        }
        return false;

      default:
        return true;
    }
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, part) => {
      return current && current[part];
    }, obj);
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    const target = parts.reduce((current, part) => {
      return (current[part] = current[part] || {});
    }, obj);
    target[last] = value;
  }

  public process(context: MappingContext): Record<string, any> {
    const { sourceData, targetSchema, rules = [], options = {} } = context;
    const result: Record<string, any> = {};

    // 处理映射规则
    for (const rule of rules) {
      const sourceValue = this.getValueByPath(sourceData, rule.source);

      // 检查条件
      if (rule.condition && !this.evaluateCondition(sourceValue, rule.condition)) {
        if (rule.default !== undefined) {
          this.setValueByPath(result, rule.target, rule.default);
        }
        continue;
      }

      // 应用转换
      let targetValue = sourceValue;
      if (rule.transform) {
        targetValue = this.applyTransform(sourceValue, rule.transform);
      }

      // 设置结果
      if (targetValue !== undefined || options.preserveNull) {
        this.setValueByPath(result, rule.target, targetValue ?? rule.default);
      }
    }

    // Schema验证
    if (options.validateSchema && targetSchema) {
      if (!this.validateSchema(result, targetSchema)) {
        throw new Error('Mapping result does not match target schema');
      }
    }

    return result;
  }
}
