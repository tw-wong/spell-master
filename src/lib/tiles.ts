const EXTRA = "aeiloprstn".split("");

export function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map((x) => x[1]);
}

export function buildTileBank(word: string, fillers = 3): string[] {
  const base = word.split("");
  const pool = shuffle(EXTRA.filter((c) => !base.includes(c))).slice(0, fillers);
  return shuffle([...base, ...pool]);
}
