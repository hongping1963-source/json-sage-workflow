import * as Comlink from 'comlink';
import { WasmInference } from './inference';

// 导出Worker接口
Comlink.expose(new WasmInference());
