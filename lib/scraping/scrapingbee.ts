'use server';
import 'server-only';

/**
 * Fetches a URL using ScrapingBee API
 * @param url The target URL to scrape
 * @param options Optional configuration for ScrapingBee
 * @returns The response text
 * @throws Error if the request fails or returns a non-OK status
 */
export async function fetchWithScrapingBee(
  url: string,
  options?: {
    js_render?: boolean;
    country_code?: string;
    params?: Record<string, string>;
  }
): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  
  if (!apiKey) {
    throw new Error('SCRAPINGBEE_API_KEY environment variable is not set');
  }

  if (!url) {
    throw new Error('URL is required');
  }

  try {
    // Build the ScrapingBee URL with parameters
    const scrapingBeeUrl = new URL('https://app.scrapingbee.com/api/v1/');
    
    // Add API key
    scrapingBeeUrl.searchParams.append('api_key', apiKey);
    
    // Add target URL
    scrapingBeeUrl.searchParams.append('url', url);
    
    // Add JavaScript rendering option (default: false)
    scrapingBeeUrl.searchParams.append(
      'render_js', 
      options?.js_render === true ? 'true' : 'false'
    );
    
    // Add country code (default: 'ca' for Canada)
    scrapingBeeUrl.searchParams.append(
      'country_code', 
      options?.country_code || 'ca'
    );
    
    // Add any additional parameters
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        scrapingBeeUrl.searchParams.append(key, value);
      });
    }

    // Make the request
    const response = await fetch(scrapingBeeUrl.toString(), {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
    });

    // Check if the response is OK
    if (!response.ok) {
      // Try to get error details from the response
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        // Ignore error reading response text
      }
      
      throw new Error(
        `ScrapingBee request failed with status ${response.status}: ${
          errorText || response.statusText
        }`
      );
    }

    // Return the response text
    return await response.text();
  } catch (error) {
    // Re-throw the error with additional context
    if (error instanceof Error) {
      throw new Error(`ScrapingBee error: ${error.message}`);
    }
    throw new Error(`ScrapingBee unknown error: ${String(error)}`);
  }
}
