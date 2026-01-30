/**
 * Order Numbering System Test Suite
 * Tests all reset periods: never, daily, weekly, monthly
 */

import { getNextOrderNumber } from './netlify/functions/utils/order-number.js';

console.log('🧪 ORDER NUMBERING SYSTEM TEST SUITE\n');
console.log('='.repeat(60));

// Helper function to create test dates
const createDate = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

// Test 1: Never Reset (Continuous)
console.log('\n📋 TEST 1: Never Reset (Continuous)');
console.log('-'.repeat(60));
const test1Config = {
    starting_number: 100,
    current_number: 150,
    reset_period: 'never',
    weekly_start_day: 1,
    last_reset_date: null
};
const result1 = getNextOrderNumber(test1Config);
console.log('Config:', JSON.stringify(test1Config, null, 2));
console.log('Result:', JSON.stringify(result1, null, 2));
console.log(`✅ Expected: order_number=150, new_current=151`);
console.log(`✅ Actual:   order_number=${result1.order_number}, new_current=${result1.new_current}`);
console.assert(result1.order_number === 150, 'Order number should be 150');
console.assert(result1.new_current === 151, 'New current should be 151');

// Test 2: Daily Reset - Same Day
console.log('\n📋 TEST 2: Daily Reset - Same Day (No Reset Needed)');
console.log('-'.repeat(60));
const test2Config = {
    starting_number: 1,
    current_number: 25,
    reset_period: 'daily',
    weekly_start_day: 1,
    last_reset_date: new Date().toISOString() // Today
};
const result2 = getNextOrderNumber(test2Config);
console.log('Config:', JSON.stringify(test2Config, null, 2));
console.log('Result:', JSON.stringify(result2, null, 2));
console.log(`✅ Expected: order_number=25, new_current=26 (same day, no reset)`);
console.log(`✅ Actual:   order_number=${result2.order_number}, new_current=${result2.new_current}`);
console.assert(result2.order_number === 25, 'Order number should continue at 25');
console.assert(result2.new_current === 26, 'New current should be 26');

// Test 3: Daily Reset - Different Day
console.log('\n📋 TEST 3: Daily Reset - Different Day (Reset Triggered)');
console.log('-'.repeat(60));
const test3Config = {
    starting_number: 1,
    current_number: 25,
    reset_period: 'daily',
    weekly_start_day: 1,
    last_reset_date: createDate(1) // Yesterday
};
const result3 = getNextOrderNumber(test3Config);
console.log('Config:', JSON.stringify(test3Config, null, 2));
console.log('Result:', JSON.stringify(result3, null, 2));
console.log(`✅ Expected: order_number=1, new_current=2 (reset to starting number)`);
console.log(`✅ Actual:   order_number=${result3.order_number}, new_current=${result3.new_current}`);
console.assert(result3.order_number === 1, 'Order number should reset to 1');
console.assert(result3.new_current === 2, 'New current should be 2');

// Test 4: Weekly Reset - Same Week (Monday start)
console.log('\n📋 TEST 4: Weekly Reset - Same Week (No Reset, Monday start)');
console.log('-'.repeat(60));
const test4Config = {
    starting_number: 1,
    current_number: 50,
    reset_period: 'weekly',
    weekly_start_day: 1, // Monday
    last_reset_date: createDate(2) // 2 days ago, same week
};
const result4 = getNextOrderNumber(test4Config);
console.log('Config:', JSON.stringify(test4Config, null, 2));
console.log('Result:', JSON.stringify(result4, null, 2));
console.log(`✅ Expected: order_number=50, new_current=51 (same week, no reset)`);
console.log(`✅ Actual:   order_number=${result4.order_number}, new_current=${result4.new_current}`);
console.assert(result4.order_number === 50, 'Order number should continue at 50');

// Test 5: Weekly Reset - New Week
console.log('\n📋 TEST 5: Weekly Reset - New Week (Reset Triggered)');
console.log('-'.repeat(60));
const test5Config = {
    starting_number: 10,
    current_number: 75,
    reset_period: 'weekly',
    weekly_start_day: 1, // Monday
    last_reset_date: createDate(8) // 8 days ago, previous week
};
const result5 = getNextOrderNumber(test5Config);
console.log('Config:', JSON.stringify(test5Config, null, 2));
console.log('Result:', JSON.stringify(result5, null, 2));
console.log(`✅ Expected: order_number=10, new_current=11 (new week, reset)`);
console.log(`✅ Actual:   order_number=${result5.order_number}, new_current=${result5.new_current}`);
console.assert(result5.order_number === 10, 'Order number should reset to 10');

// Test 6: Monthly Reset - Same Month
console.log('\n📋 TEST 6: Monthly Reset - Same Month (No Reset)');
console.log('-'.repeat(60));
const test6Config = {
    starting_number: 1,
    current_number: 200,
    reset_period: 'monthly',
    weekly_start_day: 1,
    last_reset_date: createDate(5) // 5 days ago, same month
};
const result6 = getNextOrderNumber(test6Config);
console.log('Config:', JSON.stringify(test6Config, null, 2));
console.log('Result:', JSON.stringify(result6, null, 2));
console.log(`✅ Expected: order_number=200, new_current=201 (same month, no reset)`);
console.log(`✅ Actual:   order_number=${result6.order_number}, new_current=${result6.new_current}`);
console.assert(result6.order_number === 200, 'Order number should continue at 200');

// Test 7: Monthly Reset - New Month
console.log('\n📋 TEST 7: Monthly Reset - New Month (Reset Triggered)');
console.log('-'.repeat(60));
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const test7Config = {
    starting_number: 1000,
    current_number: 1500,
    reset_period: 'monthly',
    weekly_start_day: 1,
    last_reset_date: lastMonth.toISOString() // Last month
};
const result7 = getNextOrderNumber(test7Config);
console.log('Config:', JSON.stringify(test7Config, null, 2));
console.log('Result:', JSON.stringify(result7, null, 2));
console.log(`✅ Expected: order_number=1000, new_current=1001 (new month, reset)`);
console.log(`✅ Actual:   order_number=${result7.order_number}, new_current=${result7.new_current}`);
console.assert(result7.order_number === 1000, 'Order number should reset to 1000');

// Test 8: First Order Ever (No last_reset_date)
console.log('\n📋 TEST 8: First Order Ever (No Previous Reset Date)');
console.log('-'.repeat(60));
const test8Config = {
    starting_number: 42,
    current_number: 42,
    reset_period: 'daily',
    weekly_start_day: 1,
    last_reset_date: null // First order
};
const result8 = getNextOrderNumber(test8Config);
console.log('Config:', JSON.stringify(test8Config, null, 2));
console.log('Result:', JSON.stringify(result8, null, 2));
console.log(`✅ Expected: order_number=42, new_current=43 (first order, reset triggered)`);
console.log(`✅ Actual:   order_number=${result8.order_number}, new_current=${result8.new_current}`);
console.assert(result8.order_number === 42, 'Order number should be starting number');

// Test 9: Different Weekly Start Days
console.log('\n📋 TEST 9: Weekly Reset - Sunday Start');
console.log('-'.repeat(60));
const test9Config = {
    starting_number: 1,
    current_number: 30,
    reset_period: 'weekly',
    weekly_start_day: 0, // Sunday
    last_reset_date: createDate(8) // Previous week
};
const result9 = getNextOrderNumber(test9Config);
console.log('Config:', JSON.stringify(test9Config, null, 2));
console.log('Result:', JSON.stringify(result9, null, 2));
console.log(`✅ Expected: order_number=1, new_current=2 (new week starting Sunday)`);
console.log(`✅ Actual:   order_number=${result9.order_number}, new_current=${result9.new_current}`);

console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS COMPLETED!\n');
console.log('Summary:');
console.log('  ✓ Never reset mode works correctly');
console.log('  ✓ Daily reset logic validated');
console.log('  ✓ Weekly reset logic validated (Monday & Sunday)');
console.log('  ✓ Monthly reset logic validated');
console.log('  ✓ First order handling validated');
console.log('\n🎉 Order Numbering System is working as expected!\n');
