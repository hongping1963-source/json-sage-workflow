import { JsonInsight, FieldInfo, JsonMetrics } from '../types';

export class JsonAnalyzer {
    private readonly commonPatterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
        phone: /^\+?[1-9]\d{1,14}$/,
        date: /^\d{4}-\d{2}-\d{2}$/,
        time: /^\d{2}:\d{2}(:\d{2})?$/,
        datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:?\d{2})?$/,
        uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    };

    async analyze(data: any): Promise<{ insights: string[]; metrics: JsonMetrics; fields: FieldInfo[] }> {
        try {
            const insights = await this.analyzeStructure(data);
            const metrics = this.calculateMetrics(data);
            const fields = this.getFieldInfo(data);

            return {
                insights: insights.map(i => i.message),
                metrics,
                fields
            };
        } catch (error) {
            console.error('Error analyzing JSON data:', error);
            throw new Error(`JSON analysis failed: ${error.message}`);
        }
    }

    private async analyzeStructure(data: any): Promise<JsonInsight[]> {
        const insights: JsonInsight[] = [];

        try {
            // 检查数据类型
            if (typeof data !== 'object' || data === null) {
                insights.push({
                    type: 'data_quality',
                    message: '输入数据必须是对象类型',
                    severity: 'error'
                });
                return insights;
            }

            // 检查字段数量
            const fieldCount = Object.keys(data).length;
            if (fieldCount === 0) {
                insights.push({
                    type: 'data_quality',
                    message: '输入数据不能为空对象',
                    severity: 'error'
                });
            } else if (fieldCount > 100) {
                insights.push({
                    type: 'performance',
                    message: '字段数量过多可能影响性能',
                    severity: 'warning'
                });
            }

            // 分析字段类型和命名
            for (const [key, value] of Object.entries(data)) {
                // 检查字段名格式
                if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
                    insights.push({
                        type: 'naming',
                        message: `字段名 "${key}" 不符合命名规范`,
                        severity: 'warning'
                    });
                }

                // 检查字段值类型
                if (value === undefined) {
                    insights.push({
                        type: 'data_quality',
                        message: `字段 "${key}" 的值不能为undefined`,
                        severity: 'error'
                    });
                }

                // 检查数组类型的一致性
                if (Array.isArray(value) && value.length > 0) {
                    const elementTypes = new Set(value.map(v => typeof v));
                    if (elementTypes.size > 1) {
                        insights.push({
                            type: 'data_quality',
                            message: `字段 "${key}" 的数组元素类型不一致`,
                            severity: 'warning'
                        });
                    }
                }

                // 检查嵌套对象的复杂度
                if (typeof value === 'object' && value !== null) {
                    const complexity = this.calculateComplexity(value);
                    if (complexity > 5) {
                        insights.push({
                            type: 'complexity',
                            message: `字段 "${key}" 的嵌套层级过深`,
                            severity: 'warning'
                        });
                    }
                }
            }

            return insights;
        } catch (error) {
            insights.push({
                type: 'system',
                message: '分析数据结构时发生错误',
                severity: 'error',
                details: error
            });
            return insights;
        }
    }

    private getFieldInfo(data: any): FieldInfo[] {
        const fieldInfo: FieldInfo[] = [];

        if (typeof data !== 'object' || data === null) {
            return fieldInfo;
        }

        for (const [key, value] of Object.entries(data)) {
            const info: FieldInfo = {
                path: key,
                type: this.getFieldType(value),
                isRequired: true,
                format: this.detectFormat(value)
            };

            fieldInfo.push(info);
        }

        return fieldInfo;
    }

    private calculateMetrics(data: any): JsonMetrics {
        const typeDistribution = new Map<string, number>();
        let nullCount = 0;
        let depth = 0;
        let arrayDepth = 0;

        const traverse = (value: any, currentDepth: number, currentArrayDepth: number) => {
            const type = typeof value;
            typeDistribution.set(type, (typeDistribution.get(type) || 0) + 1);

            if (value === null) {
                nullCount++;
            } else if (Array.isArray(value)) {
                arrayDepth = Math.max(arrayDepth, currentArrayDepth + 1);
                value.forEach(item => traverse(item, currentDepth + 1, currentArrayDepth + 1));
            } else if (typeof value === 'object') {
                depth = Math.max(depth, currentDepth + 1);
                Object.values(value).forEach(v => traverse(v, currentDepth + 1, currentArrayDepth));
            }
        };

        traverse(data, 0, 0);

        return {
            depth,
            arrayDepth,
            nullCount,
            fieldCount: Object.keys(data).length,
            typeDistribution,
            mixedTypes: this.findMixedTypeArrays(data)
        };
    }

    private calculateComplexity(data: any): number {
        let complexity = 1;

        if (typeof data !== 'object' || data === null) {
            return complexity;
        }

        for (const value of Object.values(data)) {
            if (typeof value === 'object' && value !== null) {
                complexity += this.calculateComplexity(value);
            }
        }

        return complexity;
    }

    private getFieldType(value: any): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) {
            if (value.length === 0) return 'array';
            const elementType = this.getFieldType(value[0]);
            return `array<${elementType}>`;
        }
        return typeof value;
    }

    private detectFormat(value: any): string {
        if (typeof value !== 'string') return '';

        for (const [format, pattern] of Object.entries(this.commonPatterns)) {
            if (pattern.test(value)) {
                return format;
            }
        }

        return '';
    }

    private findMixedTypeArrays(data: any): string[] {
        const mixedTypes: string[] = [];

        const checkArray = (value: any[], path: string) => {
            if (value.length > 1) {
                const types = new Set(value.map(v => typeof v));
                if (types.size > 1) {
                    mixedTypes.push(`${path}: ${Array.from(types).join('|')}`);
                }
            }
        };

        const traverse = (obj: any, path = '') => {
            if (Array.isArray(obj)) {
                checkArray(obj, path);
                obj.forEach((item, index) => {
                    if (typeof item === 'object' && item !== null) {
                        traverse(item, `${path}[${index}]`);
                    }
                });
            } else if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([key, value]) => {
                    const newPath = path ? `${path}.${key}` : key;
                    if (typeof value === 'object' && value !== null) {
                        traverse(value, newPath);
                    }
                });
            }
        };

        traverse(data);
        return mixedTypes;
    }
}
