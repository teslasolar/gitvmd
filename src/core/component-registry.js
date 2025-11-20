/**
 * Component Registry - Manages Perspective component definitions
 * Each component <250 tokens, modular architecture
 */

export class ComponentRegistry {
    constructor() {
        this.components = new Map();
        this.baseURL = '/components';
    }

    async loadComponent(type) {
        if (this.components.has(type)) {
            return this.components.get(type);
        }

        const [category, name] = type.split('.');
        const url = `${this.baseURL}/${category}/${name}.json`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Component not found: ${type}`);
        }

        const componentDef = await response.json();
        this.components.set(type, componentDef);
        return componentDef;
    }

    async createInstance(type, props = {}) {
        const definition = await this.loadComponent(type);
        return new ComponentInstance(definition, props);
    }
}

class ComponentInstance {
    constructor(definition, props) {
        this.definition = definition;
        this.props = this.mergeProps(definition.props, props);
        this.element = null;
    }

    mergeProps(defaults, overrides) {
        const merged = {};
        for (const [key, config] of Object.entries(defaults)) {
            merged[key] = overrides[key] ?? config.default;
        }
        return merged;
    }

    render() {
        const element = document.createElement('div');
        element.className = `component-${this.definition.meta.name}`;
        this.element = element;
        return element;
    }
}
