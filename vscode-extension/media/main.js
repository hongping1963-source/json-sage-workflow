// @ts-check

(function () {
    const vscode = acquireVsCodeApi();
    const schemaTree = document.getElementById('schema-tree');
    const propertyEditor = document.getElementById('property-editor');

    // 初始化 Schema 树
    function initSchemaTree(schema) {
        schemaTree.innerHTML = '';
        renderSchemaNode(schema, schemaTree);
    }

    // 渲染 Schema 节点
    function renderSchemaNode(node, container, path = '') {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'schema-node';

        if (node.type === 'object') {
            renderObjectNode(node, nodeElement, path);
        } else if (node.type === 'array') {
            renderArrayNode(node, nodeElement, path);
        } else {
            renderPropertyNode(node, nodeElement, path);
        }

        container.appendChild(nodeElement);
    }

    // 渲染对象节点
    function renderObjectNode(node, container, path) {
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <span class="node-type">Object</span>
            <span class="node-name">${path}</span>
            <button class="add-property">+</button>
        `;
        container.appendChild(header);

        const properties = document.createElement('div');
        properties.className = 'node-properties';
        
        if (node.properties) {
            Object.entries(node.properties).forEach(([key, value]) => {
                renderSchemaNode(value, properties, path ? `${path}.${key}` : key);
            });
        }

        container.appendChild(properties);
    }

    // 渲染数组节点
    function renderArrayNode(node, container, path) {
        const header = document.createElement('div');
        header.className = 'node-header';
        header.innerHTML = `
            <span class="node-type">Array</span>
            <span class="node-name">${path}</span>
        `;
        container.appendChild(header);

        if (node.items) {
            renderSchemaNode(node.items, container, `${path}[]`);
        }
    }

    // 渲染属性节点
    function renderPropertyNode(node, container, path) {
        container.innerHTML = `
            <div class="node-header">
                <span class="node-type">${node.type}</span>
                <span class="node-name">${path}</span>
            </div>
        `;

        container.addEventListener('click', () => {
            showPropertyEditor(node, path);
        });
    }

    // 显示属性编辑器
    function showPropertyEditor(property, path) {
        propertyEditor.innerHTML = `
            <h3>Edit Property: ${path}</h3>
            <form id="property-form">
                <div class="form-group">
                    <label>Type:</label>
                    <select name="type">
                        <option value="string" ${property.type === 'string' ? 'selected' : ''}>String</option>
                        <option value="number" ${property.type === 'number' ? 'selected' : ''}>Number</option>
                        <option value="boolean" ${property.type === 'boolean' ? 'selected' : ''}>Boolean</option>
                        <option value="object" ${property.type === 'object' ? 'selected' : ''}>Object</option>
                        <option value="array" ${property.type === 'array' ? 'selected' : ''}>Array</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea name="description">${property.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Required:</label>
                    <input type="checkbox" name="required" ${property.required ? 'checked' : ''}>
                </div>
                ${getTypeSpecificFields(property)}
                <button type="submit">Save</button>
            </form>
        `;

        document.getElementById('property-form').addEventListener('submit', (e) => {
            e.preventDefault();
            saveProperty(property, path, e.target);
        });
    }

    // 获取类型特定的字段
    function getTypeSpecificFields(property) {
        switch (property.type) {
            case 'string':
                return `
                    <div class="form-group">
                        <label>Format:</label>
                        <select name="format">
                            <option value="">None</option>
                            <option value="email" ${property.format === 'email' ? 'selected' : ''}>Email</option>
                            <option value="uri" ${property.format === 'uri' ? 'selected' : ''}>URI</option>
                            <option value="date-time" ${property.format === 'date-time' ? 'selected' : ''}>Date-Time</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Pattern:</label>
                        <input type="text" name="pattern" value="${property.pattern || ''}">
                    </div>
                `;
            case 'number':
                return `
                    <div class="form-group">
                        <label>Minimum:</label>
                        <input type="number" name="minimum" value="${property.minimum || ''}">
                    </div>
                    <div class="form-group">
                        <label>Maximum:</label>
                        <input type="number" name="maximum" value="${property.maximum || ''}">
                    </div>
                `;
            default:
                return '';
        }
    }

    // 保存属性
    function saveProperty(property, path, form) {
        const formData = new FormData(form);
        const updates = {
            type: formData.get('type'),
            description: formData.get('description'),
            required: formData.get('required') === 'on'
        };

        // 添加类型特定的字段
        if (updates.type === 'string') {
            updates.format = formData.get('format');
            updates.pattern = formData.get('pattern');
        } else if (updates.type === 'number') {
            updates.minimum = Number(formData.get('minimum'));
            updates.maximum = Number(formData.get('maximum'));
        }

        // 更新属性
        Object.assign(property, updates);

        // 通知 VSCode 更新
        vscode.postMessage({
            command: 'updateSchema',
            path: path,
            updates: updates
        });

        // 刷新视图
        initSchemaTree(currentSchema);
    }

    // 监听来自 VSCode 的消息
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'updateSchema':
                currentSchema = message.schema;
                initSchemaTree(currentSchema);
                break;
        }
    });

    // 初始化
    let currentSchema = {};
    initSchemaTree(currentSchema);
})();
