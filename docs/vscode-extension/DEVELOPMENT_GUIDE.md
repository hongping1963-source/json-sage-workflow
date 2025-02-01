# JsonSageAI VSCode Extension Development Guide

## Overview

JsonSageAI VSCode Extension is a powerful tool that integrates JsonSageAI capabilities directly into Visual Studio Code. It provides features for JSON Schema generation, validation, and conversion with an intuitive user interface.

## Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── features/                 # Core features
│   │   ├── schemaGenerator.ts    # Schema generation
│   │   ├── schemaValidator.ts    # Schema validation
│   │   └── jsonConverter.ts      # JSON to Schema conversion
│   ├── language/                 # Language server
│   │   ├── client.ts            # Language client
│   │   └── server.ts            # Language server
│   ├── ui/                      # UI components
│   │   ├── webview/             # Webview panels
│   │   │   ├── SchemaEditor.ts  # Schema editor
│   │   │   └── PreviewPanel.ts  # Preview panel
│   │   └── statusBar.ts         # Status bar
│   └── test/                    # Test files
├── media/                       # UI assets
└── .github/                     # GitHub workflows
```

## Features

1. **Schema Generation**
   - Natural language to JSON Schema conversion
   - JSON to Schema conversion
   - Interactive schema editor

2. **Language Server Features**
   - Code completion
   - Hover information
   - Real-time diagnostics
   - Schema validation

3. **UI Components**
   - Schema Editor
   - Preview Panel
   - Status Bar integration

## Development Setup

1. **Prerequisites**
   ```bash
   node >= 16.x
   npm >= 8.x
   Visual Studio Code
   ```

2. **Installation**
   ```bash
   git clone <repository-url>
   cd vscode-extension
   npm install
   ```

3. **Environment Variables**
   ```
   DEEPSEEK_API_KEY=your_api_key
   ```

## Testing

1. **Running Tests**
   ```bash
   npm run test        # All tests
   npm run test:unit   # Unit tests
   npm run test:e2e    # E2E tests
   npm run coverage    # Coverage report
   ```

2. **Test Structure**
   - Unit tests in `src/test/suite/`
   - E2E tests in `src/test/e2e/`
   - Test helpers in `src/test/helper.ts`

## CI/CD Pipeline

1. **GitHub Actions Workflow**
   - Triggers on push to main and PRs
   - Runs on multiple Node.js versions
   - Performs:
     - Linting
     - Unit tests
     - E2E tests
     - Coverage reporting
     - Automatic releases
     - VS Code marketplace publishing

2. **Required Secrets**
   - `DEEPSEEK_API_KEY`: API key for testing
   - `CODECOV_TOKEN`: Token for coverage reports
   - `VSCE_TOKEN`: Token for marketplace publishing

## Code Quality

1. **ESLint Configuration**
   - TypeScript-specific rules
   - Naming conventions
   - Code style enforcement

2. **Coverage Requirements**
   - 80% branch coverage
   - 80% line coverage
   - 80% function coverage
   - 80% statement coverage

## Building and Publishing

1. **Local Build**
   ```bash
   npm run compile    # Compile TypeScript
   npm run package    # Create VSIX package
   ```

2. **Publishing**
   ```bash
   npx vsce publish   # Publish to marketplace
   ```

## Best Practices

1. **Code Organization**
   - Keep features modular
   - Use dependency injection
   - Follow VSCode extension guidelines

2. **Testing**
   - Write tests for new features
   - Maintain high coverage
   - Use test helpers for common operations

3. **UI Development**
   - Follow VSCode theming guidelines
   - Support light and dark themes
   - Use WebView for complex UIs

## Troubleshooting

1. **Common Issues**
   - API key configuration
   - Test environment setup
   - Language server connection

2. **Debugging**
   - Use VSCode's extension development host
   - Check output channels
   - Enable developer tools for WebViews

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
- [JsonSageAI Documentation](https://docs.jsonsage.ai)
