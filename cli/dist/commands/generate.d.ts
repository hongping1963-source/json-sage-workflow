import { SchemaOptions } from '../types';
export declare function generateSchema(description: string, options?: SchemaOptions): Promise<any>;
export declare function saveSchema(schema: any, filePath: string, format?: boolean): Promise<void>;
export declare function loadSchema(filePath: string): Promise<any>;
