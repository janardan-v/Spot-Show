export function getSeatLabel(index: number) {
  const row = String.fromCharCode(
    65 + Math.floor(index / 10),
  );

  const column = (index % 10) + 1;

  return `${row}${column}`;
}