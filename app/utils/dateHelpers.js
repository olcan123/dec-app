/**
 * Date utility functions for period and due date calculations
 */

/**
 * Format date to YYYY-MM-DD string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string or empty string
 */
export const formatDate = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

/**
 * Compute default due date for a given period
 * @param {string} period - Period in MM/YYYY or Qn/YYYY format
 * @param {number} defaultDay - Default day of month (default: 15)
 * @returns {string} Due date in YYYY-MM-DD format
 */
export const computeDefaultDueForPeriod = (period, defaultDay = 15) => {
  const p = String(period || "").trim();
  const dayStr = String(defaultDay).padStart(2, "0");

  // Handle MM/YYYY format (monthly)
  const monthMatch = p.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  if (monthMatch) {
    let month = Number(monthMatch[1]);
    let year = Number(monthMatch[2]);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    return `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
  }

  // Handle Qn/YYYY format (quarterly)
  const quarterMatch = p.match(/^[Qq]([1-4])\/(\d{4})$/);
  if (quarterMatch) {
    const q = Number(quarterMatch[1]);
    let year = Number(quarterMatch[2]);
    let dueMonth = q * 3 + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      year += 1;
    }
    return `${year}-${String(dueMonth).padStart(2, "0")}-${dayStr}`;
  }

  return "";
};

/**
 * Convert MM/YYYY to Qn/YYYY if month is end of quarter
 * @param {string} period - Period in MM/YYYY format
 * @returns {string|null} Quarter format (Qn/YYYY) or null
 */
export const monthToQuarterIfEnd = (period) => {
  const match = String(period || "")
    .trim()
    .match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  if (!match) return null;
  
  const month = Number(match[1]);
  const year = Number(match[2]);
  
  if (![3, 6, 9, 12].includes(month)) return null;
  return `Q${Math.ceil(month / 3)}/${year}`;
};

/**
 * Extract year from period string
 * @param {string} period - Period in MM/YYYY or Qn/YYYY format
 * @returns {number|null} Year as number or null
 */
export const getYearFromPeriod = (period) => {
  if (!period) return null;
  const s = String(period).trim();
  
  // MM/YYYY format
  const monthMatch = s.match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  if (monthMatch) return Number(monthMatch[2]);
  
  // Qn/YYYY format
  const quarterMatch = s.match(/^[Qq]([1-4])\/(\d{4})$/);
  if (quarterMatch) return Number(quarterMatch[2]);
  
  return null;
};

/**
 * Extract month from period string
 * @param {string} period - Period in MM/YYYY format
 * @returns {number|null} Month as number (1-12) or null
 */
export const getMonthFromPeriod = (period) => {
  if (!period) return null;
  const match = String(period).trim().match(/^(0?[1-9]|1[0-2])\/(\d{4})$/);
  return match ? Number(match[1]) : null;
};