// src/screens/Mine.tsx
import { useEffect, useState } from 'react'
import {
  Box, Button, HStack, Heading, Text, VStack, Badge,
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

const readSkin = () =>
  (typeof window !== 'undefined' ? localStorage.getItem('shop_active_skin') : null)

export function Mine() {
  const [state, setState] = useState<GameState>(load())
  const [boostOpen, setBoostOpen] = useState(false)
  const [pops, setPops] = useState<Pop[]>([])
  const [skinId, setSkinId] = useState<string | null>(readSkin())

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

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    const name = tg?.initDataUnsafe?.user?.first_name || tg?.initDataUnsafe?.user?.username
    if (name && name !== state.username) {
      const s = { ...state, username: name }; save(s); setState(s)
    }
    try { tg?.expand?.(); tg?.setHeaderColor?.('#0a0a0a'); tg?.ready?.(); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (state.energy <= 0) return
    let s = { ...state }
    s.energy -= 1
    s.coins += s.multi
    s.xp += s.multi
    while (s.xp >= nextThreshold(s.level)) s.level += 1
    save(s); setState(s)

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const id = Date.now() + Math.random()
    setPops(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top, count: s.multi }])
    setTimeout(() => setPops(p => p.filter(pp => pp.id !== id)), 700)
  }

  return (
    <Box className="screen" pt={2}>
      {/* Привітання + бейдж монет справа */}
      <HStack justify="space-between">
        <Heading size="md">Привіт, @{state.username}</Heading>
        <HStack
          bg="#1e3a8a"
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
        mt={2}                 // трохи нижче
      >
        <Text><b>Earn</b> 5000 CuleCoins</Text>
        <Button size="sm" {...yellowBtnProps}>Join</Button>
      </HStack>

      {/* Центральний лічильник — більший */}
      <HStack spacing={4} align="center" justify="center" w="100%" mt={1}>
        <CoinIcon width={56} height={56} />            {/* ↑ збільшено */}
        <Heading
          fontSize={['44px','56px','64px']}           {/* ↑ збільшено */}
          fontWeight={900}
          sx={{ textShadow: '0 6px 24px rgba(0,0,0,.35)' }}
        >
          {state.coins}
        </Heading>
      </HStack>

      {/* Футболка */}
      <Box position="relative" w="100%" display="grid" placeItems="center" mt={1}>
        <JerseyCard
          key={`jersey-${skinId || 'default'}`}
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

      {/* Ряд: Енергія — Boost — Множник (в один рівень) */}
      <HStack justify="space-between" align="center" w="100%" mt={2}>
        <Badge
          px="2.5" py="1.5" borderRadius="10px"
          bg="rgba(255,255,255,0.06)" border="1px solid rgba(255,255,255,0.08)"
          fontWeight="700" fontSize="sm"
        >
          ⚡ {state.energy}/{state.energyMax}
        </Badge>

        <Button {...yellowBtnProps} onClick={() => setBoostOpen(true)}>
          Boost
        </Button>

        <Badge
          px="2.5" py="1.5" borderRadius="10px"
          bg="rgba(255,255,255,0.06)" border="1px solid rgba(255,255,255,0.08)"
          fontWeight="700" fontSize="sm"
        >
          ×{state.multi} 👉
        </Badge>
      </HStack>

      {/* Прогрес рівня */}
      <VStack mt={2} spacing={2}>
        <LevelProgress xp={state.xp} need={need} />
        {/* Кнопку “Скинути прогрес” прибрано */}
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
