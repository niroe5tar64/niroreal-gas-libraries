export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear().toString();
  const month = `0${date.getMonth() + 1}`.slice(-2); // 月は0ベース
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);

  // フォーマットに応じて置換
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}
