const PERIOD_REGEX = /^(0[1-9]|1[0-2])\/(\d{4})$/;

const parsePeriodName = (periodName) => {
  if (!periodName || typeof periodName !== "string") {
    return null;
  }

  const match = periodName.match(PERIOD_REGEX);
  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);
  const key = year * 12 + month;

  return { month, year, key };
};

const comparePeriods = (a, b) => {
  const aMeta = parsePeriodName(a);
  const bMeta = parsePeriodName(b);

  if (!aMeta && !bMeta) {
    return 0;
  }

  if (!aMeta) {
    return -1;
  }

  if (!bMeta) {
    return 1;
  }

  return aMeta.key - bMeta.key;
};

const formatNextPeriodName = (periodName) => {
  const meta = parsePeriodName(periodName);

  if (!meta) {
    return "";
  }

  let month = meta.month + 1;
  let year = meta.year;

  if (month > 12) {
    month = 1;
    year += 1;
  }

  return `${String(month).padStart(2, "0")}/${year}`;
};

const findLatestPeriodName = (periodNames = []) => {
  if (!Array.isArray(periodNames) || !periodNames.length) {
    return "";
  }

  const sorted = [...periodNames].sort(comparePeriods);
  return sorted[sorted.length - 1] ?? "";
};

export { parsePeriodName, comparePeriods, formatNextPeriodName, findLatestPeriodName };
