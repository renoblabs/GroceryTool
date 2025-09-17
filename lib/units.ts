/**
 * Unit normalization utilities for grocery price comparison
 * Handles conversion between common grocery units and calculates unit prices
 */

// Standard units supported in the system
export type StandardUnit = 'ea' | 'dozen' | 'g' | 'kg' | 'ml' | 'l';

// Base units for each measurement category
export type BaseUnit = 'ea' | 'g' | 'ml';

// Unit variations that should map to standard units
const unitMappings: Record<string, StandardUnit> = {
  // Count units
  'ea': 'ea',
  'each': 'ea',
  'piece': 'ea',
  'pc': 'ea',
  'pcs': 'ea',
  'ct': 'ea',
  'count': 'ea',
  'item': 'ea',
  'items': 'ea',
  
  // Dozen
  'dozen': 'dozen',
  'dz': 'dozen',
  'doz': 'dozen',
  '12pk': 'dozen',
  
  // Weight - metric
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'gr': 'g',
  
  'kg': 'kg',
  'kilo': 'kg',
  'kilos': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  
  // Volume - metric
  'ml': 'ml',
  'milliliter': 'ml',
  'millilitre': 'ml',
  'milliliters': 'ml',
  'millilitres': 'ml',
  
  'l': 'l',
  'liter': 'l',
  'litre': 'l',
  'liters': 'l',
  'litres': 'l',
};

/**
 * Normalizes a unit string to a standard unit
 * @param unit The unit string to normalize
 * @returns A standardized unit ('ea', 'dozen', 'g', 'kg', 'ml', 'l')
 */
export function normalizeUnit(unit: string): StandardUnit {
  if (!unit) return 'ea';
  
  // Clean up the input: lowercase, remove periods, trim
  const cleanUnit = unit.toLowerCase().replace(/\./g, '').trim();
  
  // Direct lookup in our mappings
  if (cleanUnit in unitMappings) {
    return unitMappings[cleanUnit];
  }
  
  // Handle common variations with regex patterns
  if (/^(ea|each|piece|pc|pcs|ct|count|item|items)s?$/i.test(cleanUnit)) {
    return 'ea';
  }
  
  if (/^doz(en)?s?$/i.test(cleanUnit)) {
    return 'dozen';
  }
  
  if (/^g(ram)?s?$/i.test(cleanUnit)) {
    return 'g';
  }
  
  if (/^k(ilo)?g(ram)?s?$/i.test(cleanUnit)) {
    return 'kg';
  }
  
  if (/^m(illi)?l(iter|itre)?s?$/i.test(cleanUnit)) {
    return 'ml';
  }
  
  if (/^l(iter|itre)?s?$/i.test(cleanUnit)) {
    return 'l';
  }
  
  // Default to each if we can't determine the unit
  return 'ea';
}

/**
 * Converts a quantity in any standard unit to its base unit quantity
 * @param qty The quantity value
 * @param unit The unit (will be normalized if not standard)
 * @returns Object with converted quantity and base unit
 */
export function toBaseQuantity(qty: number, unit: string): { qty: number, base: BaseUnit } {
  if (!qty || isNaN(qty)) {
    return { qty: 1, base: 'ea' };
  }
  
  const normalizedUnit = normalizeUnit(unit);
  
  switch (normalizedUnit) {
    case 'kg':
      return { qty: qty * 1000, base: 'g' };
    case 'l':
      return { qty: qty * 1000, base: 'ml' };
    case 'dozen':
      return { qty: qty * 12, base: 'ea' };
    case 'g':
      return { qty, base: 'g' };
    case 'ml':
      return { qty, base: 'ml' };
    case 'ea':
    default:
      return { qty, base: 'ea' };
  }
}

/**
 * Computes the unit price (price per base unit)
 * @param price The total price
 * @param qty The quantity
 * @param unit The unit (will be normalized)
 * @returns The unit price (price per base unit)
 */
export function computeUnitPrice(price: number, qty: number, unit: string): number {
  if (!price || isNaN(price) || price <= 0) return 0;
  if (!qty || isNaN(qty) || qty <= 0) return price;
  
  const { qty: baseQty } = toBaseQuantity(qty, unit);
  
  return price / baseQty;
}

/**
 * Formats a unit price with the appropriate base unit
 * @param unitPrice The calculated unit price
 * @param unit The original unit (will be normalized to determine base unit)
 * @returns Formatted string with unit price and base unit
 */
export function formatUnitPrice(unitPrice: number, unit: string): string {
  if (unitPrice <= 0) return '';
  
  const normalizedUnit = normalizeUnit(unit);
  let baseUnit: string;
  
  // Determine display base unit
  switch (normalizedUnit) {
    case 'kg':
    case 'g':
      baseUnit = '/100g';
      unitPrice = unitPrice * 100; // Convert to price per 100g
      break;
    case 'l':
    case 'ml':
      baseUnit = '/100ml';
      unitPrice = unitPrice * 100; // Convert to price per 100ml
      break;
    case 'dozen':
    case 'ea':
    default:
      baseUnit = '/ea';
      break;
  }
  
  return `$${unitPrice.toFixed(2)}${baseUnit}`;
}

/**
 * Parses a product size text to extract quantity and unit
 * @param sizeText Text describing product size (e.g., "500g", "2L", "12 pack")
 * @returns Parsed quantity and normalized unit, or defaults if parsing fails
 */
export function parseSize(sizeText: string): { qty: number, unit: StandardUnit } {
  if (!sizeText) {
    return { qty: 1, unit: 'ea' };
  }
  
  // Common patterns: "500g", "2 L", "12-pack", "1.5kg", etc.
  const match = sizeText.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\-]+)$/);
  
  if (match) {
    const qty = parseFloat(match[1]);
    const unit = normalizeUnit(match[2]);
    return { qty, unit };
  }
  
  // Handle "pack of X" or "X pack" patterns
  const packMatch = sizeText.match(/pack\s+of\s+(\d+)|(\d+)[\s\-]pack/i);
  if (packMatch) {
    const qty = parseInt(packMatch[1] || packMatch[2], 10);
    return { qty, unit: 'ea' };
  }
  
  // Default
  return { qty: 1, unit: 'ea' };
}
