#!/usr/bin/env node

import { searchNoFrills } from '../lib/adapters/nofrills.js';
import { searchFoodBasics } from '../lib/adapters/foodbasics.js';
import { searchWalmart } from '../lib/adapters/walmart.js';
import { searchCostco } from '../lib/adapters/costco.js';

// Sample grocery list items
const sampleItems = [
  { id: '1', raw_text: 'bananas', quantity: 2, unit: 'kg' },
  { id: '2', raw_text: 'milk 2%', quantity: 1, unit: 'l' },
  { id: '3', raw_text: 'white bread', quantity: 1, unit: 'ea' },
  { id: '4', raw_text: 'ground beef', quantity: 0.5, unit: 'kg' },
  { id: '5', raw_text: 'eggs large', quantity: 1, unit: 'dozen' },
];

const postal = 'L3K 1V8'; // Sample postal code

async function demoScraping() {
  console.log('🛒 GroceryTool Demo - Price Scraping Test');
  console.log('==========================================\n');

  console.log('📍 Postal Code:', postal);
  console.log('📝 Sample Grocery List:');
  sampleItems.forEach(item => {
    console.log(`   - ${item.raw_text} (${item.quantity} ${item.unit})`);
  });
  console.log('\n🔍 Searching stores for prices...\n');

  for (const item of sampleItems) {
    console.log(`\n🛍️  Searching for: ${item.raw_text}`);
    console.log('─'.repeat(50));

    try {
      // Search No Frills
      console.log('🟡 No Frills...');
      const noFrillsResult = await searchNoFrills(item, postal);
      console.log(`   ${noFrillsResult.available ? '✅' : '❌'} ${noFrillsResult.product_name || item.raw_text}`);
      if (noFrillsResult.available) {
        console.log(`   💰 $${noFrillsResult.price.toFixed(2)} ${noFrillsResult.unit_price ? `($${noFrillsResult.unit_price.toFixed(2)}/unit)` : ''}`);
        if (noFrillsResult.size) console.log(`   📦 ${noFrillsResult.size}`);
      }

      // Search Food Basics
      console.log('🔵 Food Basics...');
      const foodBasicsResult = await searchFoodBasics(item, postal);
      console.log(`   ${foodBasicsResult.available ? '✅' : '❌'} ${foodBasicsResult.product_name || item.raw_text}`);
      if (foodBasicsResult.available) {
        console.log(`   💰 $${foodBasicsResult.price.toFixed(2)} ${foodBasicsResult.unit_price ? `($${foodBasicsResult.unit_price.toFixed(2)}/unit)` : ''}`);
        if (foodBasicsResult.size) console.log(`   📦 ${foodBasicsResult.size}`);
      }

      // Search Walmart
      console.log('🔴 Walmart...');
      const walmartResult = await searchWalmart(item, postal);
      console.log(`   ${walmartResult.available ? '✅' : '❌'} ${walmartResult.product_name || item.raw_text}`);
      if (walmartResult.available) {
        console.log(`   💰 $${walmartResult.price.toFixed(2)} ${walmartResult.unit_price ? `($${walmartResult.unit_price.toFixed(2)}/unit)` : ''}`);
        if (walmartResult.size) console.log(`   📦 ${walmartResult.size}`);
      }

      // Search Costco
      console.log('🟠 Costco...');
      const costcoResult = await searchCostco(item, postal);
      console.log(`   ${costcoResult.available ? '✅' : '❌'} ${costcoResult.product_name || item.raw_text}`);
      if (costcoResult.available) {
        console.log(`   💰 $${costcoResult.price.toFixed(2)} ${costcoResult.unit_price ? `($${costcoResult.unit_price.toFixed(2)}/unit)` : ''}`);
        if (costcoResult.size) console.log(`   📦 ${costcoResult.size}`);
      }

      // Find best price
      const results = [
        { store: 'No Frills', ...noFrillsResult },
        { store: 'Food Basics', ...foodBasicsResult },
        { store: 'Walmart', ...walmartResult },
        { store: 'Costco', ...costcoResult }
      ].filter(r => r.available);

      if (results.length > 0) {
        const bestPrice = Math.min(...results.map(r => r.price));
        const bestStore = results.find(r => r.price === bestPrice);
        console.log(`\n🏆 Best Price: ${bestStore.store} - $${bestPrice.toFixed(2)}`);
      } else {
        console.log('\n❌ No prices found for this item');
      }

    } catch (error) {
      console.error(`❌ Error searching for ${item.raw_text}:`, error.message);
    }
  }

  console.log('\n🎉 Demo complete!');
  console.log('\nNote: Without ScrapingBee API key, this demo uses realistic mock data.');
  console.log('To get real prices, sign up at scrapingbee.com and add your API key to .env.local');
}

demoScraping().catch(console.error);