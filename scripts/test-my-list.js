#!/usr/bin/env node

/**
 * Test your grocery list with the price scrapers
 * Usage: node scripts/test-my-list.js
 * 
 * Edit the groceryList array below with your items
 */

import { searchNoFrills } from '../lib/adapters/nofrills.js';
import { searchFoodBasics } from '../lib/adapters/foodbasics.js';
import { searchWalmart } from '../lib/adapters/walmart.js';
import { searchCostco } from '../lib/adapters/costco.js';

// 🛒 EDIT YOUR GROCERY LIST HERE
const groceryList = [
  'bananas 2 kg',
  'milk 2% 1L',
  'white bread 1 loaf',
  'ground beef 500g',
  'eggs large 1 dozen',
  'chicken breast 1 kg',
  'apples red delicious 1 kg',
  'orange juice 1L',
  'pasta spaghetti 500g',
  'rice jasmine 2 kg',
  'onions yellow 1 kg',
  'carrots 1 kg',
  'bell peppers 3 ea',
  'tomatoes 1 kg',
  'cheddar cheese 400g',
  // Add your items here:
  // 'avocados 4 ea',
  // 'yogurt greek 750g',
  // 'salmon fillet 500g',
  // 'spinach baby 200g',
  // 'olive oil extra virgin 500ml',
];

const postal = 'L3K 1V8'; // Edit with your postal code

// Parse grocery list items
function parseGroceryItem(text, index) {
  const parts = text.trim().split(' ');
  let quantity = 1;
  let unit = 'ea';
  let itemName = text.trim();

  // Try to extract quantity and unit
  const quantityMatch = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
  if (quantityMatch) {
    quantity = parseFloat(quantityMatch[1]);
    unit = quantityMatch[2].toLowerCase();
    itemName = text.replace(quantityMatch[0], '').trim();
  }

  return {
    id: (index + 1).toString(),
    raw_text: itemName,
    quantity,
    unit
  };
}

async function testMyGroceryList() {
  console.log('🛒 Testing Your Grocery List');
  console.log('============================\n');

  const items = groceryList.map(parseGroceryItem);
  
  console.log(`📍 Postal Code: ${postal}`);
  console.log(`📝 Your Grocery List (${items.length} items):`);
  items.forEach((item, i) => {
    console.log(`   ${i + 1}. ${item.raw_text} (${item.quantity} ${item.unit})`);
  });
  console.log('\n🔍 Searching stores for prices...\n');

  const results = [];
  let totalNoFrills = 0, totalFoodBasics = 0, totalWalmart = 0, totalCostco = 0;
  let countNoFrills = 0, countFoodBasics = 0, countWalmart = 0, countCostco = 0;

  for (const [index, item] of items.entries()) {
    console.log(`\n${index + 1}. 🛍️  ${item.raw_text}`);
    console.log('─'.repeat(50));

    try {
      // Search all stores
      const [noFrillsResult, foodBasicsResult, walmartResult, costcoResult] = await Promise.all([
        searchNoFrills(item, postal),
        searchFoodBasics(item, postal),
        searchWalmart(item, postal),
        searchCostco(item, postal)
      ]);

      // Display results
      const storeResults = [
        { name: 'No Frills', color: '🟡', result: noFrillsResult },
        { name: 'Food Basics', color: '🔵', result: foodBasicsResult },
        { name: 'Walmart', color: '🔴', result: walmartResult },
        { name: 'Costco', color: '🟠', result: costcoResult }
      ];

      storeResults.forEach(({ name, color, result }) => {
        console.log(`${color} ${name}: ${result.available ? '✅' : '❌'} ${result.available ? `$${result.price.toFixed(2)}` : 'Not available'}`);
        if (result.available && result.unit_price) {
          console.log(`   ($${result.unit_price.toFixed(2)}/unit)`);
        }
      });

      // Track totals
      if (noFrillsResult.available) { totalNoFrills += noFrillsResult.price; countNoFrills++; }
      if (foodBasicsResult.available) { totalFoodBasics += foodBasicsResult.price; countFoodBasics++; }
      if (walmartResult.available) { totalWalmart += walmartResult.price; countWalmart++; }
      if (costcoResult.available) { totalCostco += costcoResult.price; countCostco++; }

      // Find best price
      const availableResults = storeResults.filter(s => s.result.available);
      if (availableResults.length > 0) {
        const bestPrice = Math.min(...availableResults.map(s => s.result.price));
        const bestStore = availableResults.find(s => s.result.price === bestPrice);
        console.log(`🏆 Best: ${bestStore.name} - $${bestPrice.toFixed(2)}`);
      }

      results.push({
        item: item.raw_text,
        noFrills: noFrillsResult,
        foodBasics: foodBasicsResult,
        walmart: walmartResult,
        costco: costcoResult
      });

    } catch (error) {
      console.error(`❌ Error searching for ${item.raw_text}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SHOPPING SUMMARY');
  console.log('='.repeat(60));

  const storeTotals = [
    { name: 'No Frills', total: totalNoFrills, count: countNoFrills },
    { name: 'Food Basics', total: totalFoodBasics, count: countFoodBasics },
    { name: 'Walmart', total: totalWalmart, count: countWalmart },
    { name: 'Costco', total: totalCostco, count: countCostco }
  ].filter(store => store.count > 0);

  storeTotals.forEach(store => {
    console.log(`${store.name}: $${store.total.toFixed(2)} (${store.count}/${items.length} items)`);
  });

  if (storeTotals.length > 0) {
    const cheapestStore = storeTotals.reduce((min, store) => 
      store.total < min.total ? store : min
    );
    console.log(`\n🏆 Cheapest Store: ${cheapestStore.name} - $${cheapestStore.total.toFixed(2)}`);
    
    const savings = storeTotals.reduce((max, store) => 
      store.total > max.total ? store : max
    ).total - cheapestStore.total;
    
    if (savings > 0) {
      console.log(`💰 Potential Savings: $${savings.toFixed(2)}`);
    }
  }

  console.log('\n✅ Test complete!');
  console.log('\nNext steps:');
  console.log('1. Update your grocery list in this script');
  console.log('2. Set up Supabase for the full web app');
  console.log('3. Add ScrapingBee API key for real prices');
  console.log('4. Run: npm run dev');
}

testMyGroceryList().catch(console.error);