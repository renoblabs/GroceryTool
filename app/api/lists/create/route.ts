import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabaseAdmin';

type CreateListRequest = {
  name: string;
  items: Array<{
    item: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }>;
};

export async function POST(req: NextRequest) {
  try {
    // Get and validate authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Create a temporary client to verify the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Parse request body
    const { name, items }: CreateListRequest = await req.json();

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'List name is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Validate each item has the required fields
    const invalidItems = items.filter(item => !item.item || !item.item.trim());
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: 'Each item must have a non-empty item name' },
        { status: 400 }
      );
    }

    // Get admin client to bypass RLS
    const adminClient = getAdminClient();

    // Insert the list
    const { data: listData, error: listError } = await adminClient
      .from('lists')
      .insert({
        user_id: user.id,
        name: name.trim()
      })
      .select('id')
      .single();

    if (listError) {
      console.error('Error creating list:', listError);
      return NextResponse.json(
        { error: 'Failed to create list' },
        { status: 500 }
      );
    }

    // Insert list items
    const listItems = items.map(item => ({
      list_id: listData.id,
      raw_text: item.item.trim(),
      quantity: item.quantity,
      unit: item.unit?.trim(),
      notes: item.notes?.trim()
    }));

    const { error: itemsError } = await adminClient
      .from('list_items')
      .insert(listItems);

    if (itemsError) {
      console.error('Error creating list items:', itemsError);
      
      // Clean up the list if items insertion fails
      await adminClient.from('lists').delete().eq('id', listData.id);
      
      return NextResponse.json(
        { error: 'Failed to create list items' },
        { status: 500 }
      );
    }

    // Return the created list ID
    return NextResponse.json({ id: listData.id }, { status: 201 });
  } catch (err: any) {
    console.error('Error in lists/create route:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
