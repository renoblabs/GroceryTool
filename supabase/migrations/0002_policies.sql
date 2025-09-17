-- RLS Policies for User Lists
CREATE POLICY "Lists: Allow users to select their own lists"
  ON lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Lists: Allow users to insert their own lists"
  ON lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lists: Allow users to update their own lists"
  ON lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lists: Allow users to delete their own lists"
  ON lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for List Items
CREATE POLICY "List Items: Allow users to select items from their lists"
  ON list_items FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List Items: Allow users to insert items to their lists"
  ON list_items FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List Items: Allow users to update items in their lists"
  ON list_items FOR UPDATE
  USING (
    list_id IN (
      SELECT id FROM lists WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List Items: Allow users to delete items from their lists"
  ON list_items FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM lists WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for User Locations
CREATE POLICY "Locations: Allow users to select their own locations"
  ON locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Locations: Allow users to insert their own locations"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Locations: Allow users to update their own locations"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Locations: Allow users to delete their own locations"
  ON locations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Public Catalog Tables

-- Brands
CREATE POLICY "Brands: Allow authenticated users to select"
  ON brands FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Brands: Allow service role to insert"
  ON brands FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Brands: Allow service role to update"
  ON brands FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Brands: Allow service role to delete"
  ON brands FOR DELETE
  USING (auth.role() = 'service_role');

-- Categories
CREATE POLICY "Categories: Allow authenticated users to select"
  ON categories FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Categories: Allow service role to insert"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Categories: Allow service role to update"
  ON categories FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Categories: Allow service role to delete"
  ON categories FOR DELETE
  USING (auth.role() = 'service_role');

-- Canonical Products
CREATE POLICY "Canonical Products: Allow authenticated users to select"
  ON canonical_products FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Canonical Products: Allow service role to insert"
  ON canonical_products FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Canonical Products: Allow service role to update"
  ON canonical_products FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Canonical Products: Allow service role to delete"
  ON canonical_products FOR DELETE
  USING (auth.role() = 'service_role');

-- Product Aliases
CREATE POLICY "Product Aliases: Allow authenticated users to select"
  ON product_aliases FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Product Aliases: Allow service role to insert"
  ON product_aliases FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Aliases: Allow service role to update"
  ON product_aliases FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Aliases: Allow service role to delete"
  ON product_aliases FOR DELETE
  USING (auth.role() = 'service_role');

-- Product Variants
CREATE POLICY "Product Variants: Allow authenticated users to select"
  ON product_variants FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Product Variants: Allow service role to insert"
  ON product_variants FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Variants: Allow service role to update"
  ON product_variants FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Variants: Allow service role to delete"
  ON product_variants FOR DELETE
  USING (auth.role() = 'service_role');

-- Stores
CREATE POLICY "Stores: Allow authenticated users to select"
  ON stores FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Stores: Allow service role to insert"
  ON stores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Stores: Allow service role to update"
  ON stores FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Stores: Allow service role to delete"
  ON stores FOR DELETE
  USING (auth.role() = 'service_role');

-- Store Locations
CREATE POLICY "Store Locations: Allow authenticated users to select"
  ON store_locations FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Store Locations: Allow service role to insert"
  ON store_locations FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Store Locations: Allow service role to update"
  ON store_locations FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Store Locations: Allow service role to delete"
  ON store_locations FOR DELETE
  USING (auth.role() = 'service_role');

-- Store Products
CREATE POLICY "Store Products: Allow authenticated users to select"
  ON store_products FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Store Products: Allow service role to insert"
  ON store_products FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Store Products: Allow service role to update"
  ON store_products FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Store Products: Allow service role to delete"
  ON store_products FOR DELETE
  USING (auth.role() = 'service_role');

-- Product Matches
CREATE POLICY "Product Matches: Allow authenticated users to select"
  ON product_matches FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Product Matches: Allow service role to insert"
  ON product_matches FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Matches: Allow service role to update"
  ON product_matches FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Product Matches: Allow service role to delete"
  ON product_matches FOR DELETE
  USING (auth.role() = 'service_role');

-- Prices
CREATE POLICY "Prices: Allow authenticated users to select"
  ON prices FOR SELECT
  USING (auth.role() IS NOT NULL);

CREATE POLICY "Prices: Allow service role to insert"
  ON prices FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Prices: Allow service role to update"
  ON prices FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Prices: Allow service role to delete"
  ON prices FOR DELETE
  USING (auth.role() = 'service_role');
