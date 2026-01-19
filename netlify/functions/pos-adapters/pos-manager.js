import { CustomAdapter } from './custom.js';
// import { CloverAdapter } from './clover.js';

export class POSManager {
    static getAdapter(provider) {
        switch (provider) {
            case 'custom':
                return new CustomAdapter();
            // case 'clover':
            //     return new CloverAdapter();
            default:
                throw new Error(`POS provider "${provider}" is not supported.`);
        }
    }

    static async sendOrder(settings, order) {
        if (!settings.pos_enabled) return { skipped: true, reason: "POS integration disabled" };

        const adapter = this.getAdapter(settings.pos_provider);
        return await adapter.sendOrder(settings, order);
    }
}
