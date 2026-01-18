// AI Menu Extraction Function
// This function uses OpenAI Vision API to extract menu data from photos
// For now, it returns mock data - you can integrate real AI later

export const handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { photos } = JSON.parse(event.body);

        if (!photos || photos.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No photos provided' }),
            };
        }

        // TODO: Integrate with OpenAI Vision API or Google Cloud Vision
        // For now, return mock extracted data based on the uploaded pizza menu

        const mockExtractedData = {
            items: [
                {
                    name: 'Sicilienne',
                    description: 'Sauce tomate, fromage, poivron, oignons, olives, anchois',
                    category: 'classic',
                    prices: { small: 8.90, medium: 11.90, large: 17.90 },
                    badge: null,
                },
                {
                    name: 'Calzone',
                    description: 'Sauce tomate, fromage, jambon, champignons, olives, œuf',
                    category: 'classic',
                    prices: { small: 8.90, medium: 11.90, large: 17.90 },
                    badge: null,
                },
                {
                    name: '4 Fromages',
                    description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort',
                    category: 'classic',
                    prices: { small: 8.90, medium: 12.90, large: 19.90 },
                    badge: 'Populaire',
                },
                {
                    name: 'Chicken',
                    description: 'Crème fraîche, fromage, poulet fumé, champignons',
                    category: 'premium',
                    prices: { small: 8.90, medium: 13.90, large: 19.90 },
                    badge: 'Populaire',
                },
                {
                    name: 'Buffalo',
                    description: 'Sauce barbecue, fromage, poulet fumé, viande hachée, poivron, oignon, cheddar',
                    category: 'premium',
                    prices: { small: 9.90, medium: 14.90, large: 20.90 },
                    badge: 'Épicé',
                },
            ],
        };

        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                extractedData: mockExtractedData,
                message: 'Menu data extracted successfully',
            }),
        };
    } catch (error) {
        console.error('Error extracting menu:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to extract menu data', details: error.message }),
        };
    }
};

/* 
// Real OpenAI Vision API integration (uncomment when ready):

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const extractWithAI = async (photoUrl) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [{
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Analyze this menu image and extract all menu items. For each item, provide:
                    - name
                    - description (ingredients)
                    - category (classic, premium, or special)
                    - prices for different sizes if available
                    - any badges (Populaire, Nouveau, Épicé, etc.)
                    
                    Return the data as a JSON object with an 'items' array.`
                },
                {
                    type: "image_url",
                    image_url: { url: photoUrl }
                }
            ]
        }],
        max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
};
*/
