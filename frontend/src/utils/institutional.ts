/**
 * Generates a random institutional ID following the user's specific requirements:
 * Min 4 alphabetical characters + 4 to 6 random digits.
 * Example: ACAD-102938 or TCHR-4821
 */
export const generateInstitutionalID = (prefix?: string): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Generate 4 alphabetical characters if no prefix is provided or if prefix is too short
  let alpha = prefix || '';
  if (alpha.length < 4) {
    const remaining = 4 - alpha.length;
    for (let i = 0; i < remaining; i++) {
      alpha += letters.charAt(Math.floor(Math.random() * letters.length));
    }
  }

  // Generate 4 to 6 random digits
  const digitCount = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
  let numeric = '';
  for (let i = 0; i < digitCount; i++) {
    numeric += Math.floor(Math.random() * 10).toString();
  }

  return `${alpha}-${numeric}`;
};
