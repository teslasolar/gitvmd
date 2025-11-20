/**
 * VM Engine Stub
 * Placeholder for v86/WebContainer integration
 */

export class VMEngine {
    constructor(config) {
        this.config = config;
        this.state = 'stopped';
    }

    async boot() {
        console.log('VM booting with config:', this.config);

        // Simulate boot delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.state = 'running';
        console.log('VM running');

        // TODO: Integrate v86 or WebContainer
        // For now, just show a placeholder
        const screen = document.getElementById('vm-screen');
        if (screen) {
            screen.innerHTML = `
                <div style="padding: 20px; color: #ccc;">
                    <h2>VM Engine Placeholder</h2>
                    <p>Engine: ${this.config.engine}</p>
                    <p>Memory: ${this.config.memory}</p>
                    <p>Image: ${this.config.image}</p>
                    <br>
                    <p><em>Full v86 integration coming soon...</em></p>
                </div>
            `;
        }
    }

    async shutdown() {
        this.state = 'stopped';
        console.log('VM stopped');
    }
}
