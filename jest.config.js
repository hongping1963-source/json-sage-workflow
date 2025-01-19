module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true // 提升性能
    }]
  },
  maxWorkers: '50%', // 优化并行执行
  bail: true, // 首次失败时停止
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: 'coverage',
  cache: true, // 启用缓存
  cacheDirectory: './jest-cache' // 缓存目录
};
