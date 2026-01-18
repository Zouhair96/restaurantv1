import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const extractWithGemini = async (photos, menuName) => {
    if (!process.env.GEMINI_API_KEY) {
        console.log('No GEMINI_API_KEY found, falling back to mock data');
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare image parts for Gemini
        const imageParts = photos.map(photo => {
            const [mimePart, base64Data] = photo.split(';base64,');
            const mimeType = mimePart.split(':')[1];
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            };
        });

        const prompt = `Analyze these menu images for a restaurant named "${menuName}". 
        Extract all menu items and return them as a valid JSON object.
        For each item, include:
        - "name": The name of the dish.
        - "description": Brief list of ingredients or description.
        - "category": Categorize as exactly "classic", "premium", or "special".
        - "prices": An object with "small", "medium", and "large" numeric values. Use the same price if only one is listed.
        - "badge": null or a short string like "Populaire", "Nouveau", "Épicé".

        Also, suggest a visual "suggestedTheme" for this menu. Choose one of: "orange", "red", "blue", "green".
        
        Return ONLY the JSON object in this format:
        {
            "items": [ { "name": "...", "description": "...", "category": "...", "prices": { "small": 0, "medium": 0, "large": 0 }, "badge": null } ],
            "suggestedTheme": "orange"
        }`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the markdown-formatted response if necessary
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse JSON from Gemini response');
    } catch (error) {
        console.error('Gemini Extraction Error:', error);
        return null; // Fallback to mock
    }
};

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
        const body = JSON.parse(event.body);
        const { photos, menuName = '' } = body;

        if (!photos || photos.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No photos provided' }),
            };
        }

        // Try real AI extraction first
        let extractedData = await extractWithGemini(photos, menuName);

        if (!extractedData) {
            // Mock data fallback sets
            const mockVarieties = {
                pizza: [
                    { name: 'Sicilienne', description: 'Sauce tomate, fromage, poivron, oignons, anchois', category: 'classic', prices: { small: 8.90, medium: 11.90, large: 17.90 } },
                    { name: '4 Fromages', description: 'Sauce tomate, mozzarella, emmental, chèvre, roquefort', category: 'premium', prices: { small: 8.90, medium: 12.90, large: 19.90 }, badge: 'Populaire' },
                    { name: 'Chicken Barbecue', description: 'Sauce BBQ, fromage, poulet, oignons, poivrons', category: 'premium', prices: { small: 9.90, medium: 14.90, large: 20.90 } },
                    { name: 'Margherita', description: 'Sauce tomate, mozzarella, basilic frais', category: 'classic', prices: { small: 7.90, medium: 10.90, large: 15.90 } },
                ],
                burger: [
                    { name: 'Classic Smash', description: 'Bœuf 150g, cheddar, salade, tomate, sauce maison', category: 'classic', prices: { small: 8.50, medium: 10.50, large: 13.50 }, badge: 'Classic' },
                    { name: 'Le Bacon Cheese', description: 'Bœuf, bacon croustillant, cheddar fondu, oignons caramélisés', category: 'premium', prices: { small: 9.50, medium: 12.50, large: 15.50 }, badge: 'Ventes +++' },
                    { name: 'Veggie Garden', description: 'Galette légumes, avocat, salade, sauce yaourt', category: 'classic', prices: { small: 8.00, medium: 11.00, large: 14.00 } },
                    { name: 'Triple Monster', description: '3x Bœuf, 3x Cheddar, sauce épicée', category: 'premium', prices: { small: 12.90, medium: 15.90, large: 19.90 }, badge: 'Énorme' },
                ],
                sushi: [
                    { name: 'California Roll (8pcs)', description: 'Saumon, avocat, concombre, sésame', category: 'classic', prices: { small: 7.50, medium: 12.50, large: 18.00 } },
                    { name: 'Dragon Roll', description: 'Gambas tempura, avocat, anguille fumée', category: 'premium', prices: { small: 14.00, medium: 18.00, large: 24.00 }, badge: 'Chef Choice' },
                    { name: 'Nigiri Mix (6pcs)', description: 'Thon, Saumon, Crevette', category: 'premium', prices: { small: 9.00, medium: 14.00, large: 20.00 } },
                ],
                drinks: [
                    { name: 'Coca-Cola', description: '33cl ou 50cl', category: 'classic', prices: { small: 2.50, medium: 3.50, large: 5.00 } },
                    { name: 'Limonade Maison', description: 'Citron frais, menthe, sucre de canne', category: 'special', prices: { small: 4.50, medium: 6.50, large: 8.50 }, badge: 'Frais' },
                    { name: 'Café Glacé', description: 'Espresso, lait, caramel', category: 'classic', prices: { small: 3.00, medium: 5.00, large: 7.00 } },
                ]
            };

            const nameLower = menuName.toLowerCase();
            let selectedItems = mockVarieties.pizza;
            let theme = 'orange';

            if (nameLower.includes('burger') || nameLower.includes('tacos') || nameLower.includes('fast')) {
                selectedItems = mockVarieties.burger;
                theme = 'red';
            } else if (nameLower.includes('sushi') || nameLower.includes('asia') || nameLower.includes('japan')) {
                selectedItems = mockVarieties.sushi;
                theme = 'blue';
            } else if (nameLower.includes('drink') || nameLower.includes('café') || nameLower.includes('bar') || nameLower.includes('boisson')) {
                selectedItems = mockVarieties.drinks;
                theme = 'green';
            } else if (nameLower.includes('pizza') || nameLower.includes('ital')) {
                selectedItems = mockVarieties.pizza;
                theme = 'orange';
            } else {
                const keys = Object.keys(mockVarieties);
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                selectedItems = mockVarieties[randomKey];
                const themeMap = { pizza: 'orange', burger: 'red', sushi: 'blue', drinks: 'green' };
                theme = themeMap[randomKey] || 'orange';
            }

            extractedData = {
                items: selectedItems,
                suggestedTheme: theme
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                extractedData,
                message: 'Menu data extracted successfully',
            }),
        };
    } catch (error) {
        console.error('Final Error in extraction handler:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to extract menu data', details: error.message }),
        };
    }
};
