// @ts-check

(function () {
    const vscode = acquireVsCodeApi();
    const jsonEditor = document.getElementById('jsonEditor');
    const validateBtn = document.getElementById('validateBtn');
    const generateBtn = document.getElementById('generateBtn');
    const validationResult = document.getElementById('validationResult');

    // 初始化编辑器
    function initEditor() {
        // 可以使用 Monaco Editor 或其他编辑器
        jsonEditor.value = '{\n  \n}';
    }

    // 验证 JSON
    validateBtn.addEventListener('click', () => {
        try {
            const jsonData = JSON.parse(jsonEditor.value);
            vscode.postMessage({
                command: 'validate',
                content: jsonEditor.value
            });
        } catch (error) {
            showValidationError(`Invalid JSON: ${error.message}`);
        }
    });

    // 生成示例数据
    generateBtn.addEventListener('click', () => {
        vscode.postMessage({
            command: 'generateSample'
        });
    });

    // 显示验证错误
    function showValidationError(message) {
        validationResult.innerHTML = `
            <div class="error">
                ${message}
            </div>
        `;
    }

    // 显示验证成功
    function showValidationSuccess() {
        validationResult.innerHTML = `
            <div class="success">
                JSON is valid! ✨
            </div>
        `;
    }

    // 监听来自 VSCode 的消息
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'validationResult':
                if (message.isValid) {
                    showValidationSuccess();
                } else {
                    showValidationError(message.errors.join('\n'));
                }
                break;
            case 'updateSample':
                jsonEditor.value = JSON.stringify(message.sample, null, 2);
                break;
        }
    });

    // 初始化
    initEditor();
})();
