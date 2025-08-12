export type GameState = {
  username: string; level: number; coins: number; xp: number;
  energy: number; energyMax: number; multi: number;
}
const KEY = 'blaugranes_state_v2';

export const nextThreshold = (level:number) => 1000 * Math.pow(2, level - 1);

export const defaultState: GameState = {
  username: 'culer', level: 1, coins: 0, xp: 0,
  energy: 100, energyMax: 100, multi: 1,
};

export const load = (): GameState => {
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
  catch { return defaultState }
};
export const save = (s: GameState) => localStorage.setItem(KEY, JSON.stringify(s));