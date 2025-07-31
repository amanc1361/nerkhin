
export function formatNumber(num: number | string = ""): string {
  const str = typeof num === "number" ? num.toString() : num;
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
