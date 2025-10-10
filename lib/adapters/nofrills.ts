import { fetchWithScrapingBee } from '../scraping/scrapingbee';
import * as cheerio from 'cheerio';

type ListItem = {
  id: string;
  raw_text: string;
  quantity?: number;
  unit?: string;
  notes?: string;
};

type StorePrice = {
  price: number;
  unit_price?: number;
  available: boolean;
  product_name?: string;
  size?: string;
  url?: string;
};

export async function searchNoFrills(item: ListItem, postal: string): Promise<StorePrice> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    const price = parseFloat((Math.random() * 10 + 1).toFixed(2));
    const unitPrice = parseFloat((Math.random() * 2 + 0.5).toFixed(2));

    return {
      price,
      unit_price: unitPrice,
      available: Math.random() > 0.1,
      product_name: `No Frills ${item.raw_text}`,
      size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
      url: `https://www.nofrills.ca/search?search-bar=${encodeURIComponent(item.raw_text)}`,
    };
  }

  try {
    const searchQuery = encodeURIComponent(item.raw_text);
    const url = `https://www.nofrills.ca/search?search-bar=${searchQuery}`;

    const html = await fetchWithScrapingBee(url, {
      js_render: true,
      country_code: 'ca',
    });

    const $ = cheerio.load(html);

    const firstProduct = $('.product-tile').first();

    if (!firstProduct.length) {
      return {
        price: 0,
        available: false,
        product_name: item.raw_text,
      };
    }

    const priceText = firstProduct.find('.price__value').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

    const productName = firstProduct.find('.product-name__item').text().trim();
    const productUrl = firstProduct.find('a.product-tile__link').attr('href');
    const size = firstProduct.find('.product-package-size').text().trim();

    let unitPrice: number | undefined;
    const unitPriceText = firstProduct.find('.comparison-price__value').text().trim();
    if (unitPriceText) {
      unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));
    }

    return {
      price,
      unit_price: unitPrice,
      available: price > 0,
      product_name: productName || item.raw_text,
      size: size || undefined,
      url: productUrl ? `https://www.nofrills.ca${productUrl}` : undefined,
    };
  } catch (error) {
    console.error(`Error searching No Frills for "${item.raw_text}":`, error);
    return {
      price: 0,
      available: false,
      product_name: item.raw_text,
    };
  }
}
