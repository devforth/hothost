export const clampPercentString = (value, min = 0, max) => {
  if (value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  if (Number.isFinite(max) && Number.isFinite(min)) {
    return String(Math.min(max, Math.max(min, Math.trunc(num))));
  }
  return String(Math.max(min, Math.trunc(num)));
};
