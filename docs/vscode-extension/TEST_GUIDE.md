# JsonSageAI VSCode Extension Testing Guide

## Testing Framework Overview

The JsonSageAI VSCode Extension uses a comprehensive testing framework that includes unit tests, integration tests, and end-to-end (E2E) tests.

## Test Types

### 1. Unit Tests

Located in `src/test/suite/`, unit tests cover individual components:

- **Schema Generator Tests**
  ```typescript
  test('Schema Generator - Generate from Description', async () => {
      const description = 'Create a product object with name and price';
      const schema = await schemaGenerator.generate(description);
      assert.ok(schema);
      assert.strictEqual(schema.type, 'object');
  });
  ```

- **Schema Validator Tests**
  ```typescript
  test('Schema Validator - Validate Schema', async () => {
      const schema = {
          type: 'object',
          properties: {
              name: { type: 'string' },
              price: { type: 'number' }
          }
      };
      const result = await schemaValidator.validate(JSON.stringify(schema));
      assert.ok(result.valid);
  });
  ```

### 2. E2E Tests

Located in `src/test/e2e/`, E2E tests cover full workflows:

- **Schema Generation Workflow**
  ```typescript
  test('Generate Schema from Description', async () => {
      const document = await openTextDocument('');
      await vscode.commands.executeCommand('json-sage-ai.generateSchema');
      const editor = vscode.window.activeTextEditor;
      const schema = JSON.parse(editor.document.getText());
      assert.ok(schema.type === 'object');
  });
  ```

- **UI Component Tests**
  ```typescript
  test('Schema Editor UI', async () => {
      await vscode.commands.executeCommand('json-sage-ai.openSchemaEditor');
      const editor = vscode.window.activeTextEditor;
      assert.ok(editor);
  });
  ```

## Test Configuration

### 1. Test Runner Setup

```typescript
// src/test/suite/index.ts
export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    // Add test files
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));
    });
}
```

### 2. Coverage Configuration

```json
// .nycrc
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "check-coverage": true,
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80
}
```

## Running Tests

### 1. Command Line

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Generate coverage report
npm run coverage
```

### 2. VS Code Debug Configuration

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "extensionHost",
            "request": "launch",
            "name": "Launch Extension Tests",
            "runtimeExecutable": "${execPath}",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}",
                "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
            ],
            "outFiles": ["${workspaceFolder}/out/test/**/*.js"]
        }
    ]
}
```

## Test Helpers

### 1. Extension Activation

```typescript
export async function activateExtension() {
    const ext = vscode.extensions.getExtension('json-sage-ai.json-sage-ai-vscode');
    return await ext.activate();
}
```

### 2. Document Management

```typescript
export async function createTempFile(content: string): Promise<vscode.Uri> {
    const tmpFile = path.join(__dirname, `test-${Date.now()}.json`);
    const uri = vscode.Uri.file(tmpFile);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
    return uri;
}
```

## Best Practices

1. **Test Organization**
   - Group related tests in suites
   - Use descriptive test names
   - Follow the Arrange-Act-Assert pattern

2. **Mocking**
   - Mock external dependencies
   - Use dependency injection
   - Create reusable mock factories

3. **Asynchronous Testing**
   - Use async/await
   - Handle promises correctly
   - Add appropriate timeouts

4. **Test Data**
   - Use meaningful test data
   - Create test data factories
   - Clean up test data after tests

## CI Integration

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm ci
          npm run test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

1. **Common Issues**
   - Extension activation failures
   - Timing issues in async tests
   - WebView initialization problems

2. **Solutions**
   - Use console.log for debugging
   - Check VS Code logs
   - Use the VS Code debugger

## Resources

- [VS Code Testing API](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Mocha Documentation](https://mochajs.org/)
- [NYC (Istanbul) Documentation](https://istanbul.js.org/)
