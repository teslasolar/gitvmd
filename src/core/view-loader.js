/**
 * View Loader - Loads Perspective-compatible JSON views
 * ISA-95 Level 2 HMI/SCADA implementation
 */

export class ViewLoader {
    constructor(baseURL = '/views') {
        this.baseURL = baseURL;
        this.cache = new Map();
    }

    async loadView(viewName) {
        if (this.cache.has(viewName)) {
            return this.cache.get(viewName);
        }

        const response = await fetch(`${this.baseURL}/${viewName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load view: ${viewName}`);
        }

        const viewData = await response.json();
        this.cache.set(viewName, viewData);
        return viewData;
    }

    async renderView(viewName, container, params = {}) {
        const view = await this.loadView(viewName);
        const renderer = new ViewRenderer();
        await renderer.render(view, container, params);
    }
}

class ViewRenderer {
    async render(view, container, params) {
        container.innerHTML = '';
        const root = await this.renderComponent(view.root, params);
        container.appendChild(root);
    }

    async renderComponent(component, params) {
        const element = document.createElement('div');
        element.className = `component-${component.type}`;

        // Apply props
        this.applyProps(element, component.props, params);

        // Render children
        if (component.children) {
            for (const child of component.children) {
                const childEl = await this.renderComponent(child, params);
                element.appendChild(childEl);
            }
        }

        return element;
    }

    applyProps(element, props, params) {
        for (const [key, value] of Object.entries(props)) {
            if (typeof value === 'string' && value.startsWith('{')) {
                // Tag binding
                this.bindTag(element, key, value);
            } else {
                element.dataset[key] = JSON.stringify(value);
            }
        }
    }

    bindTag(element, prop, binding) {
        // Tag binding implementation
        const tagPath = binding.slice(1, -1);
        element.dataset.binding = JSON.stringify({ prop, tagPath });
    }
}
