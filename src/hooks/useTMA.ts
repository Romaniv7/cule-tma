// src/types/telegram.d.ts вже є в src/
import { useEffect } from 'react'
import { load, save } from '../lib/game'

export function useTMAUsername() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    const st = load()
    const name = tg?.initDataUnsafe?.user?.first_name || tg?.initDataUnsafe?.user?.username
    if (name && st.username !== name) { st.username = name; save(st) }
    try { tg?.expand?.(); tg?.setHeaderColor?.('#0a0a0a'); tg?.ready?.(); } catch {}
  }, [])
}
