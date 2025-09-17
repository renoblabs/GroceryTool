import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { url } = body;

    // Validate URL exists
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'URL must use HTTP or HTTPS protocol' },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate it's a Google Docs URL
    if (!parsedUrl.hostname.includes('docs.google.com')) {
      return NextResponse.json(
        { error: 'URL must point to Google Docs' },
        { status: 400 }
      );
    }

    // Fetch the CSV
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch CSV: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the CSV content
    const csvContent = await response.text();

    // Return the CSV as plain text
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error in proxy-csv route:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
