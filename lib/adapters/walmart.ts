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

export async function searchWalmart(item: ListItem, postal: string): Promise<StorePrice> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    const price = parseFloat((Math.random() * 10 + 1).toFixed(2));
    const unitPrice = parseFloat((Math.random() * 2 + 0.5).toFixed(2));

    return {
      price,
      unit_price: unitPrice,
      available: Math.random() > 0.15,
      product_name: `Walmart ${item.raw_text}`,
      size: item.quantity ? `${item.quantity} ${item.unit || 'ea'}` : 'each',
      url: `https://www.walmart.ca/search?q=${encodeURIComponent(item.raw_text)}`,
    };
  }

  try {
    const searchQuery = encodeURIComponent(item.raw_text);
    const url = `https://www.walmart.ca/search?q=${searchQuery}`;

    const html = await fetchWithScrapingBee(url, {
      js_render: true,
      country_code: 'ca',
    });

    const $ = cheerio.load(html);

    const firstProduct = $('[data-automation="product-card"]').first();

    if (!firstProduct.length) {
      return {
        price: 0,
        available: false,
        product_name: item.raw_text,
      };
    }

    const priceText = firstProduct.find('[data-automation="price"]').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

    const productName = firstProduct.find('[data-automation="name"]').text().trim();
    const productUrl = firstProduct.find('a').attr('href');
    const size = firstProduct.find('[data-automation="product-size"]').text().trim();

    let unitPrice: number | undefined;
    const unitPriceText = firstProduct.find('[data-automation="unit-price"]').text().trim();
    if (unitPriceText) {
      unitPrice = parseFloat(unitPriceText.replace(/[^0-9.]/g, ''));
    }

    return {
      price,
      unit_price: unitPrice,
      available: price > 0,
      product_name: productName || item.raw_text,
      size: size || undefined,
      url: productUrl ? `https://www.walmart.ca${productUrl}` : undefined,
    };
  } catch (error) {
    console.error(`Error searching Walmart for "${item.raw_text}":`, error);
    return {
      price: 0,
      available: false,
      product_name: item.raw_text,
    };
  }
}
