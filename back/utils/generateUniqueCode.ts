/**
 * Generate a unique code for various purposes (groups, certificates, etc.)
 * @param length - Length of the random part of the code
 * @param prefix - Optional prefix to add to the code
 * @returns A unique code string
 */
export function generateUniqueCode(length: number = 8, prefix?: string): string {
  // Character set excluding confusing characters (0, O, 1, I, l)
  const charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  let result = "";

  // Generate random characters
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }

  // Add prefix if provided
  if (prefix) {
    return `${prefix}-${result}`;
  }

  return result;
}

/**
 * Generate a numeric code (useful for simple group codes)
 * @param length - Length of the numeric code
 * @returns A numeric code string
 */
export function generateNumericCode(length: number = 6): string {
  const numbers = "123456789"; // Excluding 0 to avoid confusion
  let result = "";

  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < length; i++) {
    result += numbers[randomBytes[i] % numbers.length];
  }

  return result;
}

/**
 * Generate a certificate ID with specific format
 * @param year - Year for the certificate
 * @param courseCode - Course identifier
 * @returns Certificate ID in format: IRAC-YYYY-COURSE-XXXXXX
 */
export function generateCertificateId(year: number, courseCode: string): string {
  const randomPart = generateNumericCode(6);
  return `IRAC-${year}-${courseCode.toUpperCase()}-${randomPart}`;
}

/**
 * Generate a group invitation code (shorter, easier to share)
 * @returns A 6-character group invitation code
 */
export function generateGroupInviteCode(): string {
  return generateUniqueCode(6);
}
