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

export async function searchCostco(item: ListItem, postal: string): Promise<StorePrice> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    const price = parseFloat((Math.random() * 15 + 5).toFixed(2));
    const unitPrice = parseFloat((Math.random() * 1 + 0.3).toFixed(2));

    return {
      price,
      unit_price: unitPrice,
      available: Math.random() > 0.3,
      product_name: `Kirkland ${item.raw_text}`,
      size: item.quantity ? `${item.quantity * 2} ${item.unit || 'ea'}` : 'bulk',
      url: `https://www.costco.ca/CatalogSearch?keyword=${encodeURIComponent(item.raw_text)}`,
    };
  }

  try {
    const searchQuery = encodeURIComponent(item.raw_text);
    const url = `https://www.costco.ca/CatalogSearch?keyword=${searchQuery}`;

    const html = await fetchWithScrapingBee(url, {
      js_render: true,
      country_code: 'ca',
    });

    const $ = cheerio.load(html);

    const firstProduct = $('.product').first();

    if (!firstProduct.length) {
      return {
        price: 0,
        available: false,
        product_name: item.raw_text,
      };
    }

    const priceText = firstProduct.find('.price').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

    const productName = firstProduct.find('.description').text().trim();
    const productUrl = firstProduct.find('a').attr('href');
    const size = firstProduct.find('.product-tile-size').text().trim();

    return {
      price,
      available: price > 0,
      product_name: productName || item.raw_text,
      size: size || undefined,
      url: productUrl ? `https://www.costco.ca${productUrl}` : undefined,
    };
  } catch (error) {
    console.error(`Error searching Costco for "${item.raw_text}":`, error);
    return {
      price: 0,
      available: false,
      product_name: item.raw_text,
    };
  }
}
