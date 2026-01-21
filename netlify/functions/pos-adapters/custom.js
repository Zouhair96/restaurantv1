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

            // Try to get response body as JSON, fallback to text
            let result = {};
            const contentType = response.headers.get("content-type") || "";

            try {
                if (contentType.includes("application/json")) {
                    result = await response.json();
                } else {
                    const text = await response.text();
                    result = { message: text.substring(0, 500) || "OK" };
                }
            } catch (e) {
                result = { message: "Body parsing failed", error: e.message };
            }

            return {
                success: response.ok,
                status: response.status,
                external_id: result.id || result.external_id || null,
                error: response.ok ? null : `External server returned status ${response.status}`,
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
