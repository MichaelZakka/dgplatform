const AR_MONTHS = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

function toArabicDigits(value: string | number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/\d/g, (d) => map[Number(d)]);
}

/** Formats an ISO date (YYYY-MM-DD or full ISO) into an Arabic Gregorian date. */
export function formatArabicDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = toArabicDigits(date.getDate());
  const month = AR_MONTHS[date.getMonth()];
  const year = toArabicDigits(date.getFullYear());
  return `${day} ${month} ${year}`;
}

export function arabicNumber(value: number | string): string {
  return toArabicDigits(value);
}
