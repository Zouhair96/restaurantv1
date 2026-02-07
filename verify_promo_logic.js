
import { calculateLoyaltyDiscount } from './src/utils/promoUtils.js';
import { LOYALTY_MESSAGE_KEYS } from './src/translations/loyaltyMessages.js';

// MOCK DATA FROM STEP 1152
const loyaltyInfo = {
    "totalPoints": 0,
    "totalVisits": 0,
    "ordersInCurrentVisit": 0,
    "totalCompletedOrders": 1,
    "sessionIsValid": false,
    "activeGifts": [
        {
            "id": 23,
            "euro_value": "0.00",
            "type": "PERCENTAGE",
            "percentage_value": "10.00",
            "status": "unused",
            "created_at": "new Date().toISOString()"
        }
    ],
    "config": {
        "loyalConfig": {
            "type": "item",
            "value": "royal burger",
            "active": true,
            "threshold": "30"
        },
        "isAutoPromoOn": true,
        "welcomeConfig": {
            "value": "10",
            "active": true
        },
        "points_system_enabled": true
    },
    "uiState": "GIFT_AVAILABLE",
    "totalCompletedOrders": 1
};

const result = calculateLoyaltyDiscount(loyaltyInfo, 0, loyaltyInfo.config);

console.log('--- RESULT ---');
console.log(JSON.stringify(result, null, 2));

if (result.welcomeTeaser && result.messageKey === LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER) {
    console.log('SUCCESS: Logic returns correct teaser for Session 2');
} else {
    console.log('FAILURE: Logic does NOT return correct teaser');
    console.log('Expected Key:', LOYALTY_MESSAGE_KEYS.SESSION_2_BEFORE_ORDER);
    console.log('Actual Key:', result.messageKey);
}
