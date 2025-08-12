// src/screens/Mine.tsx
import { useEffect, useState } from 'react'
import {
  Box, Button, HStack, Heading, Text, VStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { defaultState, load, save, nextThreshold } from '../lib/game'
import type { GameState } from '../lib/game'
import { JerseyCard } from '../components/JerseyCard'
import { BoostModal } from '../components/BoostModal'
import { CoinIcon, yellowBtnProps } from '../ui'
import { LevelProgress } from '../components/LevelProgress'

const MotionBox = motion(Box)

type Pop = { id: number; x: number; y: number; count: number }

// читання активного скіна (із сховища)
const readSkin = () =>
  (typeof window !== 'undefined' ? localStorage.getItem('shop_active_skin') : null)

export function Mine() {
  const [state, setState] = useState<GameState>(load())
  const [boostOpen, setBoostOpen] = useState(false)
  const [pops, setPops] = useState<Pop[]>([])
  const [skinId, setSkinId] = useState<string | null>(readSkin())

  // слухаємо зміну скіна з Profile + оновлюємо при поверненні на сторінку
  useEffect(() => {
    const onSkin = (e: Event) => {
      const id = (e as CustomEvent).detail as string
      setSkinId(id)
    }
    const onFocus = () => setSkinId(readSkin())

    window.addEventListener('skin:changed', onSkin as EventListener)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      window.removeEventListener('skin:changed', onSkin as EventListener)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  // Telegram username
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    const name = tg?.initDataUnsafe?.user?.first_name || tg?.initDataUnsafe?.user?.username
    if (name && name !== state.username) {
      const s = { ...state, username: name }; save(s); setState(s)
    }
    try { tg?.expand?.(); tg?.setHeaderColor?.('#0a0a0a'); tg?.ready?.(); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Енергія реген
  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => {
        if (prev.energy >= prev.energyMax) return prev
        const s = { ...prev, energy: prev.energy + 1 }; save(s); return s
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const need = nextThreshold(state.level)

  // Тап по футболці
  function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (state.energy <= 0) return
    let s = { ...state }
    s.energy -= 1
    s.coins += s.multi
    s.xp += s.multi
    while (s.xp >= nextThreshold(s.level)) s.level += 1
    save(s); setState(s)

    // поп з кількістю монет = множнику
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const id = Date.now() + Math.random()
    setPops(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, count: s.multi }])
    setTimeout(() => setPops(p => p.filter(pp => pp.id !== id)), 700)
  }

  const reset = () => { save(defaultState); setState(load()) }

  return (
    <Box className="screen">
      {/* Вітання + правий бейдж очок (blau фон) */}
      <HStack justify="space-between">
        <Heading size="md">Привіт, @{state.username}</Heading>
        <HStack
          bg="#1e3a8a"         // blau
          color="white"
          borderRadius="12px"
          px="3"
          py="1.5"
          fontWeight="800"
          spacing={2}
        >
          <CoinIcon width={16} height={16} />
          <Box as="span">{state.coins}</Box>
        </HStack>
      </HStack>

      {/* Earn банер */}
      <HStack
        justify="space-between"
        p="3"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="lg"
        bg="#a2224c"
      >
        <Text><b>Earn</b> 5000 CuleCoins</Text>
        <Button size="sm" {...yellowBtnProps}>Join</Button>
      </HStack>

      {/* Центральний лічильник монет з іконкою */}
      <HStack spacing={4} align="center" justify="center" w="100%">
        <CoinIcon width={40} height={40} />
        <Heading fontSize={['36px','44px','52px']}>{state.coins}</Heading>
      </HStack>

      {/* Футболка + монетки (оригінальний SVG, без круглої підкладки) */}
      <Box position="relative" w="100%" display="grid" placeItems="center" mt={2}>
        <JerseyCard
          key={`jersey-${skinId || 'default'}`} // важливо!
          username={state.username}
          level={state.level}
          onTap={tap}
          activeSkinId={skinId || undefined}
                    />


        <Box position="absolute" inset={0} pointerEvents="none">
          <AnimatePresence>
            {pops.map(p => {
              const coins = Array.from({ length: p.count })
              return coins.map((_, i) => {
                const dx = (i - (coins.length - 1) / 2) * 10
                const dy = -24 - Math.abs(dx) * 0.4
                return (
                  <MotionBox
                    key={`${p.id}-${i}`}
                    position="absolute"
                    left={p.x}
                    top={p.y}
                    transform="translate(-50%, -50%)"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
                    animate={{ opacity: 1, x: dx, y: dy, scale: 1 }}
                    exit={{ opacity: 0, y: dy - 16, scale: 0.96 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    sx={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.35))' }}
                  >
                    <CoinIcon width={18} height={18} />
                  </MotionBox>
                )
              })
            })}
          </AnimatePresence>
        </Box>
      </Box>
            
      {/* Показники під карткою */}
      <HStack justify="space-between">
        <Text>⚡ {state.energy}/{state.energyMax}</Text>
        <HStack spacing={1}><Text>×{state.multi}</Text><Text>👉</Text></HStack>
      </HStack>

      {/* Дії */}
      <VStack>
        <Button {...yellowBtnProps} onClick={() => setBoostOpen(true)}>Boost</Button>
        <LevelProgress xp={state.xp} need={need} />
        <Button size="xs" variant="outline" onClick={reset}>Скинути прогрес (demo)</Button>
      </VStack>

      {/* Boost модалка */}
      <BoostModal
        isOpen={boostOpen}
        onClose={() => setBoostOpen(false)}
        state={state}
        setState={(s) => { save(s); setState(s) }}
      />
    </Box>
  )
}