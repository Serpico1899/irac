import { coreApp } from "../../mod.ts";
import { ObjectId } from "@deps";

// Counter collection for tracking invoice sequences
const COUNTER_COLLECTION = "invoice_counters";

export interface InvoiceNumberResult {
  number: string;
  sequence: number;
  fiscal_year: number;
}

// Initialize counter for a fiscal year if it doesn't exist
const initializeCounter = async (fiscalYear: number): Promise<void> => {
  const db = coreApp.clients.mongo.db();
  const counterCollection = db.collection(COUNTER_COLLECTION);

  const existingCounter = await counterCollection.findOne({
    fiscal_year: fiscalYear
  });

  if (!existingCounter) {
    await counterCollection.insertOne({
      _id: new ObjectId(),
      fiscal_year: fiscalYear,
      sequence: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
};

// Get next sequence number for a fiscal year (atomic operation)
const getNextSequenceNumber = async (fiscalYear: number): Promise<number> => {
  const db = coreApp.clients.mongo.db();
  const counterCollection = db.collection(COUNTER_COLLECTION);

  // Ensure counter exists for this fiscal year
  await initializeCounter(fiscalYear);

  // Atomically increment and get the next sequence number
  const result = await counterCollection.findOneAndUpdate(
    { fiscal_year: fiscalYear },
    {
      $inc: { sequence: 1 },
      $set: { updated_at: new Date() }
    },
    {
      returnDocument: "after",
      upsert: true
    }
  );

  if (!result.value) {
    throw new Error(`Failed to generate sequence number for fiscal year ${fiscalYear}`);
  }

  return result.value.sequence;
};

// Format sequence number with leading zeros
const formatSequenceNumber = (sequence: number, length: number = 4): string => {
  return sequence.toString().padStart(length, '0');
};

// Generate invoice number in format: INV-YYYY-NNNN
export const generateInvoiceNumber = async (): Promise<InvoiceNumberResult> => {
  try {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();

    // Get next sequence number for this fiscal year
    const sequence = await getNextSequenceNumber(fiscalYear);

    // Format the invoice number
    const formattedSequence = formatSequenceNumber(sequence);
    const invoiceNumber = `INV-${fiscalYear}-${formattedSequence}`;

    return {
      number: invoiceNumber,
      sequence: sequence,
      fiscal_year: fiscalYear,
    };
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Failed to generate invoice number");
  }
};

// Generate invoice number with custom prefix
export const generateInvoiceNumberWithPrefix = async (
  prefix: string = "INV"
): Promise<InvoiceNumberResult> => {
  try {
    const currentDate = new Date();
    const fiscalYear = currentDate.getFullYear();

    // Get next sequence number for this fiscal year
    const sequence = await getNextSequenceNumber(fiscalYear);

    // Format the invoice number with custom prefix
    const formattedSequence = formatSequenceNumber(sequence);
    const invoiceNumber = `${prefix}-${fiscalYear}-${formattedSequence}`;

    return {
      number: invoiceNumber,
      sequence: sequence,
      fiscal_year: fiscalYear,
    };
  } catch (error) {
    console.error("Error generating invoice number with prefix:", error);
    throw new Error("Failed to generate invoice number");
  }
};

// Reset counter for a fiscal year (admin function)
export const resetInvoiceCounter = async (
  fiscalYear: number,
  startingSequence: number = 0
): Promise<void> => {
  try {
    const db = coreApp.clients.mongo.db();
    const counterCollection = db.collection(COUNTER_COLLECTION);

    await counterCollection.updateOne(
      { fiscal_year: fiscalYear },
      {
        $set: {
          sequence: startingSequence,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error resetting invoice counter:", error);
    throw new Error("Failed to reset invoice counter");
  }
};

// Get current sequence number for a fiscal year (without incrementing)
export const getCurrentSequenceNumber = async (fiscalYear: number): Promise<number> => {
  try {
    const db = coreApp.clients.mongo.db();
    const counterCollection = db.collection(COUNTER_COLLECTION);

    const counter = await counterCollection.findOne({
      fiscal_year: fiscalYear
    });

    return counter?.sequence || 0;
  } catch (error) {
    console.error("Error getting current sequence number:", error);
    throw new Error("Failed to get current sequence number");
  }
};

// Get counters for all fiscal years
export const getAllInvoiceCounters = async (): Promise<Array<{
  fiscal_year: number;
  sequence: number;
  created_at: Date;
  updated_at: Date;
}>> => {
  try {
    const db = coreApp.clients.mongo.db();
    const counterCollection = db.collection(COUNTER_COLLECTION);

    const counters = await counterCollection
      .find({})
      .sort({ fiscal_year: -1 })
      .toArray();

    return counters.map(counter => ({
      fiscal_year: counter.fiscal_year,
      sequence: counter.sequence,
      created_at: counter.created_at,
      updated_at: counter.updated_at,
    }));
  } catch (error) {
    console.error("Error getting all invoice counters:", error);
    throw new Error("Failed to get invoice counters");
  }
};

// Validate invoice number format
export const validateInvoiceNumber = (invoiceNumber: string): boolean => {
  // Pattern: PREFIX-YYYY-NNNN (e.g., INV-2024-0001)
  const pattern = /^[A-Z]{2,5}-\d{4}-\d{4}$/;
  return pattern.test(invoiceNumber);
};

// Parse invoice number to extract components
export const parseInvoiceNumber = (invoiceNumber: string): {
  prefix: string;
  fiscal_year: number;
  sequence: number;
} | null => {
  const pattern = /^([A-Z]{2,5})-(\d{4})-(\d{4})$/;
  const match = invoiceNumber.match(pattern);

  if (!match) {
    return null;
  }

  return {
    prefix: match[1],
    fiscal_year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
};

// Check if invoice number exists
export const invoiceNumberExists = async (invoiceNumber: string): Promise<boolean> => {
  try {
    const { invoice_models } = await import("@models");

    const existing = await invoice_models().findOne({
      filter: { invoice_number: invoiceNumber }
    });

    return !!existing;
  } catch (error) {
    console.error("Error checking invoice number existence:", error);
    return false;
  }
};

// Generate unique invoice number (retry if collision occurs)
export const generateUniqueInvoiceNumber = async (
  maxRetries: number = 5
): Promise<InvoiceNumberResult> => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const result = await generateInvoiceNumber();

      // Check if this number already exists
      const exists = await invoiceNumberExists(result.number);

      if (!exists) {
        return result;
      }

      attempts++;
      console.warn(`Invoice number collision detected: ${result.number}. Retrying... (${attempts}/${maxRetries})`);

      // Small delay before retry to avoid rapid consecutive calls
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));

    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        throw error;
      }

      console.warn(`Error generating invoice number (attempt ${attempts}/${maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, 100 * attempts));
    }
  }

  throw new Error(`Failed to generate unique invoice number after ${maxRetries} attempts`);
};
