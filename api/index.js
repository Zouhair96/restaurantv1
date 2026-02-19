import { parse } from 'url';

export const config = {
    api: {
        bodyParser: false,
    },
};

const getRawBody = async (readable) => {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
};

export default async function handler(req, res) {
    const { pathname } = parse(req.url, true);
    const handlerName = pathname.replace('/api/', '').split('/')[0];

    // Set default CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, stripe-signature');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Dynamically import the handler from the 'v-api' directory in the root
        const module = await import(`../v-api/${handlerName}.js`);
        const actualHandler = module.default || module.handler;

        if (typeof actualHandler !== 'function') {
            return res.status(404).json({ error: `Handler for ${handlerName} not found` });
        }

        // Special handling for Stripe Webhook (raw body needed for signature)
        if (handlerName === 'stripe-webhook') {
            return actualHandler(req, res);
        }

        // For other handlers, parse the body manually because bodyParser is disabled
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const rawBody = await getRawBody(req);
            try {
                req.body = JSON.parse(rawBody.toString());
            } catch (e) {
                req.body = {};
            }
        }

        return actualHandler(req, res);

    } catch (error) {
        console.error(`Router Error [${handlerName}]:`, error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            path: pathname,
            handler: handlerName
        });
    }
}
