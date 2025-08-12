export type GameState = {
  username: string;
  level: number;      // поточний рівень (цифра на футболці)
  coins: number;      // баланс монет
  xp: number;         // загальні «тапи» для прогресу рівня
  energy: number;     // поточна енергія
  energyMax: number;  // максимум енергії
  multi: number;      // множник тапу (1..6)
}

const KEY = 'blaugranes_state_v1';

export function loadState(): GameState {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  return { username: 'culer', level: 1, coins: 0, xp: 0, energy: 100, energyMax: 100, multi: 1 };
}

export function saveState(s: GameState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function nextThreshold(level: number) {
  // Поріг до наступного рівня: 1000 × 2^(level−1)
  return 1000 * Math.pow(2, level - 1);
}