export class CustomAdapter {
    async sendOrder(settings, order) {
        const url = settings.pos_webhook_url;
        const apiKey = settings.pos_api_key;

        if (!url) {
            throw new Error("Missing Webhook URL for custom POS integration");
        }

        console.log(`📡 Sending order ${order.id} to custom POS: ${url}`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
                    'X-DigiMenu-Platform': 'v1'
                },
                body: JSON.stringify({
                    platform_info: {
                        name: "DigiMenu",
                        version: "1.0.0"
                    },
                    order_data: order
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`POS Webhook failed (${response.status}): ${errorText}`);
            }

            const result = await response.json();
            return {
                success: true,
                external_id: result.id || result.external_id || null,
                raw_response: result
            };
        } catch (error) {
            console.error('❌ Custom POS Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async syncStock(settings) {
        // To be implemented: Polling the stock_sync_url if provided
        return { message: "Stock sync not implemented for custom adapter yet" };
    }
}
