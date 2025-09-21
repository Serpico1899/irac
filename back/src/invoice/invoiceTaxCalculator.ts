import { ObjectId } from "@deps";

// Iranian tax configuration
export const IRANIAN_TAX_CONFIG = {
  VAT: {
    rate: 9, // 9% VAT rate in Iran
    name: "مالیات بر ارزش افزوده",
    name_en: "Value Added Tax",
    code: "VAT",
    type: "vat" as const,
  },
  SERVICE_TAX: {
    rate: 5, // Service tax rate
    name: "مالیات خدمات",
    name_en: "Service Tax",
    code: "SRV",
    type: "service_tax" as const,
  },
  WITHHOLDING_TAX: {
    rate: 10, // Withholding tax rate
    name: "مالیات تکلیفی",
    name_en: "Withholding Tax",
    code: "WTH",
    type: "withholding_tax" as const,
  },
};

export interface TaxCalculationLineItem {
  item_id: string;
  item_type: "course" | "workshop" | "product" | "service";
  name: string;
  unit_price: number;
  quantity: number;
  discount_amount?: number;
  discount_percentage?: number;
  tax_exempt?: boolean;
  tax_rate?: number;
  force_inclusive?: boolean;
}

export interface TaxBreakdown {
  tax_id: string;
  name: string;
  name_en?: string;
  rate: number;
  amount: number;
  tax_type: "vat" | "service_tax" | "withholding_tax" | "exempt";
  is_inclusive: boolean;
  taxable_amount: number;
}

export interface CalculatedLineItem extends TaxCalculationLineItem {
  subtotal: number; // unit_price * quantity
  discount_amount: number; // calculated discount
  taxable_amount: number; // subtotal - discount
  tax_rate: number; // applied tax rate
  tax_amount: number; // calculated tax
  line_total: number; // taxable_amount + tax_amount
}

export interface InvoiceTaxCalculationResult {
  line_items: CalculatedLineItem[];
  subtotal: number;
  total_discount: number;
  total_tax: number;
  total_amount: number;
  tax_breakdown: TaxBreakdown[];
  summary: {
    taxable_amount: number;
    tax_exempt_amount: number;
    effective_tax_rate: number;
  };
}

// Calculate tax for a single line item
export const calculateLineItemTax = (
  item: TaxCalculationLineItem,
  defaultTaxRate: number = IRANIAN_TAX_CONFIG.VAT.rate,
  isInclusive: boolean = false
): CalculatedLineItem => {
  const subtotal = item.unit_price * item.quantity;

  // Calculate discount
  let discountAmount = item.discount_amount || 0;
  if (item.discount_percentage && item.discount_percentage > 0) {
    discountAmount = subtotal * (item.discount_percentage / 100);
  }
  discountAmount = Math.min(discountAmount, subtotal); // Cap at subtotal

  const taxableAmount = subtotal - discountAmount;

  // Determine tax rate
  let taxRate = item.tax_exempt ? 0 : (item.tax_rate ?? defaultTaxRate);

  // Calculate tax amount
  let taxAmount: number;
  let lineTotal: number;

  if (item.force_inclusive !== undefined) {
    isInclusive = item.force_inclusive;
  }

  if (isInclusive) {
    // Tax is included in the price
    taxAmount = taxableAmount - (taxableAmount / (1 + taxRate / 100));
    lineTotal = taxableAmount;
  } else {
    // Tax is added to the price
    taxAmount = taxableAmount * (taxRate / 100);
    lineTotal = taxableAmount + taxAmount;
  }

  // Round to 2 decimal places
  taxAmount = Math.round(taxAmount * 100) / 100;
  lineTotal = Math.round(lineTotal * 100) / 100;

  return {
    ...item,
    subtotal: Math.round(subtotal * 100) / 100,
    discount_amount: Math.round(discountAmount * 100) / 100,
    taxable_amount: Math.round(taxableAmount * 100) / 100,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    line_total: lineTotal,
  };
};

// Calculate taxes for an entire invoice
export const calculateInvoiceTaxes = (
  items: TaxCalculationLineItem[],
  options: {
    default_tax_rate?: number;
    is_inclusive?: boolean;
    tax_exempt?: boolean;
    apply_service_tax?: boolean;
    apply_withholding_tax?: boolean;
    currency?: string;
  } = {}
): InvoiceTaxCalculationResult => {
  const {
    default_tax_rate = IRANIAN_TAX_CONFIG.VAT.rate,
    is_inclusive = false,
    tax_exempt = false,
    apply_service_tax = false,
    apply_withholding_tax = false,
  } = options;

  // Calculate each line item
  const calculatedItems = items.map(item => {
    const effectiveTaxExempt = tax_exempt || item.tax_exempt;
    return calculateLineItemTax(
      { ...item, tax_exempt: effectiveTaxExempt },
      default_tax_rate,
      is_inclusive
    );
  });

  // Calculate totals
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = calculatedItems.reduce((sum, item) => sum + item.discount_amount, 0);
  const totalTax = calculatedItems.reduce((sum, item) => sum + item.tax_amount, 0);
  const totalAmount = calculatedItems.reduce((sum, item) => sum + item.line_total, 0);

  // Calculate taxable and exempt amounts
  const taxableAmount = calculatedItems
    .filter(item => !item.tax_exempt && item.tax_rate > 0)
    .reduce((sum, item) => sum + item.taxable_amount, 0);

  const taxExemptAmount = calculatedItems
    .filter(item => item.tax_exempt || item.tax_rate === 0)
    .reduce((sum, item) => sum + item.taxable_amount, 0);

  // Create tax breakdown
  const taxBreakdown: TaxBreakdown[] = [];

  // VAT breakdown
  const vatAmount = calculatedItems
    .filter(item => !item.tax_exempt && item.tax_rate > 0)
    .reduce((sum, item) => sum + item.tax_amount, 0);

  if (vatAmount > 0) {
    taxBreakdown.push({
      tax_id: new ObjectId().toString(),
      name: IRANIAN_TAX_CONFIG.VAT.name,
      name_en: IRANIAN_TAX_CONFIG.VAT.name_en,
      rate: default_tax_rate,
      amount: Math.round(vatAmount * 100) / 100,
      tax_type: IRANIAN_TAX_CONFIG.VAT.type,
      is_inclusive,
      taxable_amount: Math.round(taxableAmount * 100) / 100,
    });
  }

  // Service tax (if applicable)
  if (apply_service_tax) {
    const serviceTaxAmount = taxableAmount * (IRANIAN_TAX_CONFIG.SERVICE_TAX.rate / 100);
    if (serviceTaxAmount > 0) {
      taxBreakdown.push({
        tax_id: new ObjectId().toString(),
        name: IRANIAN_TAX_CONFIG.SERVICE_TAX.name,
        name_en: IRANIAN_TAX_CONFIG.SERVICE_TAX.name_en,
        rate: IRANIAN_TAX_CONFIG.SERVICE_TAX.rate,
        amount: Math.round(serviceTaxAmount * 100) / 100,
        tax_type: IRANIAN_TAX_CONFIG.SERVICE_TAX.type,
        is_inclusive: false,
        taxable_amount: Math.round(taxableAmount * 100) / 100,
      });
    }
  }

  // Withholding tax (if applicable)
  if (apply_withholding_tax) {
    const withholdingTaxAmount = taxableAmount * (IRANIAN_TAX_CONFIG.WITHHOLDING_TAX.rate / 100);
    if (withholdingTaxAmount > 0) {
      taxBreakdown.push({
        tax_id: new ObjectId().toString(),
        name: IRANIAN_TAX_CONFIG.WITHHOLDING_TAX.name,
        name_en: IRANIAN_TAX_CONFIG.WITHHOLDING_TAX.name_en,
        rate: IRANIAN_TAX_CONFIG.WITHHOLDING_TAX.rate,
        amount: Math.round(withholdingTaxAmount * 100) / 100,
        tax_type: IRANIAN_TAX_CONFIG.WITHHOLDING_TAX.type,
        is_inclusive: false,
        taxable_amount: Math.round(taxableAmount * 100) / 100,
      });
    }
  }

  // Calculate effective tax rate
  const effectiveTaxRate = subtotal > 0 ? (totalTax / subtotal) * 100 : 0;

  return {
    line_items: calculatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    total_discount: Math.round(totalDiscount * 100) / 100,
    total_tax: Math.round(totalTax * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    tax_breakdown: taxBreakdown,
    summary: {
      taxable_amount: Math.round(taxableAmount * 100) / 100,
      tax_exempt_amount: Math.round(taxExemptAmount * 100) / 100,
      effective_tax_rate: Math.round(effectiveTaxRate * 100) / 100,
    },
  };
};

// Calculate compound taxes (tax on tax)
export const calculateCompoundTaxes = (
  baseAmount: number,
  taxRates: { rate: number; name: string; compound?: boolean }[]
): { amount: number; breakdown: Array<{ name: string; rate: number; amount: number; base: number }> } => {
  let currentBase = baseAmount;
  const breakdown: Array<{ name: string; rate: number; amount: number; base: number }> = [];
  let totalTaxAmount = 0;

  for (const tax of taxRates) {
    const taxAmount = currentBase * (tax.rate / 100);
    totalTaxAmount += taxAmount;

    breakdown.push({
      name: tax.name,
      rate: tax.rate,
      amount: Math.round(taxAmount * 100) / 100,
      base: Math.round(currentBase * 100) / 100,
    });

    // If compound tax, add this tax to the base for next calculation
    if (tax.compound) {
      currentBase += taxAmount;
    }
  }

  return {
    amount: Math.round(totalTaxAmount * 100) / 100,
    breakdown,
  };
};

// Validate tax calculation
export const validateTaxCalculation = (result: InvoiceTaxCalculationResult): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if totals match
  const calculatedSubtotal = result.line_items.reduce((sum, item) => sum + item.subtotal, 0);
  if (Math.abs(calculatedSubtotal - result.subtotal) > 0.01) {
    errors.push(`Subtotal mismatch: calculated ${calculatedSubtotal}, reported ${result.subtotal}`);
  }

  const calculatedTax = result.line_items.reduce((sum, item) => sum + item.tax_amount, 0);
  if (Math.abs(calculatedTax - result.total_tax) > 0.01) {
    errors.push(`Tax total mismatch: calculated ${calculatedTax}, reported ${result.total_tax}`);
  }

  const calculatedTotal = result.line_items.reduce((sum, item) => sum + item.line_total, 0);
  if (Math.abs(calculatedTotal - result.total_amount) > 0.01) {
    errors.push(`Total amount mismatch: calculated ${calculatedTotal}, reported ${result.total_amount}`);
  }

  // Check tax breakdown totals
  const breakdownTotal = result.tax_breakdown.reduce((sum, tax) => sum + tax.amount, 0);
  if (Math.abs(breakdownTotal - result.total_tax) > 0.01) {
    warnings.push(`Tax breakdown total (${breakdownTotal}) doesn't match total tax (${result.total_tax})`);
  }

  // Check for negative values
  result.line_items.forEach((item, index) => {
    if (item.tax_amount < 0) {
      warnings.push(`Line item ${index + 1} has negative tax amount: ${item.tax_amount}`);
    }
    if (item.line_total < 0) {
      errors.push(`Line item ${index + 1} has negative total: ${item.line_total}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Format currency for Iranian Rial
export const formatIranianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR', {
    style: 'currency',
    currency: 'IRR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert tax rates for different bases
export const convertTaxRate = (
  rate: number,
  fromType: 'inclusive' | 'exclusive',
  toType: 'inclusive' | 'exclusive'
): number => {
  if (fromType === toType) {
    return rate;
  }

  if (fromType === 'inclusive' && toType === 'exclusive') {
    // Convert from tax-inclusive rate to tax-exclusive rate
    return (rate / (100 - rate)) * 100;
  } else {
    // Convert from tax-exclusive rate to tax-inclusive rate
    return (rate / (100 + rate)) * 100;
  }
};
