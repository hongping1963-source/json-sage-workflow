const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const MODELS_DIR = path.join(__dirname, '..', 'models', 'smolvlm-v1');
const MODEL_FILES = {
  'model.onnx': 'https://huggingface.co/smolvlm/SmolVLM/resolve/main/model.onnx',
  'tokenizer.model': 'https://huggingface.co/smolvlm/SmolVLM/resolve/main/tokenizer.model',
  'config.json': 'https://huggingface.co/smolvlm/SmolVLM/resolve/main/config.json'
};

async function downloadFile(url, outputPath) {
  console.log(`Downloading ${url} to ${outputPath}...`);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  await pipeline(response.data, fs.createWriteStream(outputPath));
  console.log(`Downloaded ${outputPath}`);
}

async function main() {
  // 创建模型目录
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  // 下载所有模型文件
  for (const [filename, url] of Object.entries(MODEL_FILES)) {
    const outputPath = path.join(MODELS_DIR, filename);
    if (!fs.existsSync(outputPath)) {
      try {
        await downloadFile(url, outputPath);
      } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
        process.exit(1);
      }
    } else {
      console.log(`${filename} already exists, skipping...`);
    }
  }

  console.log('All model files downloaded successfully!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
