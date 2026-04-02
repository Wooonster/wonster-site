const SITE_TIMEZONE = "Asia/Shanghai";

function getDateParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.formatToParts(new Date());
}

export function getCurrentSiteDateStamp() {
  const parts = getDateParts();
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

export function getCurrentSiteDateLabel() {
  return getCurrentSiteDateStamp();
}
