
// MOCK CONFIG
const config = { welcomeConfig: { value: '10', active: true } };

// MOCK LOYALTY CONTEXT LOGIC
let loyaltyData = {};

function trackVisit(restaurantName) {
    if (!loyaltyData[restaurantName]) {
        loyaltyData[restaurantName] = { visits: [], lastOfferType: 'NEW', welcomeShown: false };
    }
    const log = loyaltyData[restaurantName];
    log.visits.push(Date.now());

    if (log.visits.length === 1) log.lastOfferType = 'NEW';
    else if (log.visits.length >= 4) log.lastOfferType = 'LOYAL';
    else log.lastOfferType = 'SOFT';

    return log.lastOfferType;
}

function getStatus(restaurantName) {
    const log = loyaltyData[restaurantName];
    if (!log) return { status: 'NEW', welcomeRedeemed: false };
    return {
        status: log.lastOfferType,
        welcomeRedeemed: !!log.welcomeRedeemed
    };
}

function markRewardAsUsed(restaurantName) {
    const currentData = loyaltyData[restaurantName] || { visits: [], lastOfferType: 'NEW' };
    const isWelcomePhase = currentData.lastOfferType === 'NEW';

    loyaltyData[restaurantName] = {
        ...currentData,
        rewardUsedInSession: true,
        welcomeRedeemed: isWelcomePhase ? true : currentData.welcomeRedeemed
    };

    console.log(`[MarkUsed] Setting welcomeRedeemed to: ${isWelcomePhase ? true : currentData.welcomeRedeemed}`);
}

// MOCK PROMO UTILS
function calculateDiscount(loyaltyInfo, orderTotal) {
    console.log(`[Calc] Status: ${loyaltyInfo.status}, Redeemed: ${loyaltyInfo.welcomeRedeemed}`);

    if (loyaltyInfo.status === 'NEW' && !loyaltyInfo.welcomeRedeemed) {
        return "10% DISCOUNT APPLIED";
    }
    return "NO DISCOUNT";
}

// --- SIMULATION ---
console.log("--- START SIMULATION ---");
const R = "TestRest";

// 1. First Visit
console.log("\n1. Visitor arrives...");
trackVisit(R);
let status = getStatus(R);
console.log("Result:", calculateDiscount(status, 100));

// 2. Placing Order (Mark Used)
console.log("\n2. Placing Order...");
markRewardAsUsed(R);

// 3. User tries to order again immediately
console.log("\n3. Checking next order...");
status = getStatus(R); // Fetch fresh status
console.log("Result:", calculateDiscount(status, 100));

console.log("\n--- END SIMULATION ---");
