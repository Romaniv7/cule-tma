// src/screens/Profile.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Box, Heading, Text, HStack, Button,
  Input, SimpleGrid, Image, Badge, useToast
} from '@chakra-ui/react'
import { load, save } from '../lib/game'
import { yellowBtnProps, CoinIcon } from '../ui'

// Імпорти SVG видалено.

type Skin = { id: string; name: string; price: number; img: string }

// Посилання на зображення оновлено, оскільки вони тепер у папці /public
const SKINS: Skin[] = [
  { id: 'skin1', name: 'Skin #1', price: 100, img: '/skin1.svg' },
  { id: 'skin2', name: 'Skin #2', price: 100, img: '/skin2.svg' },
  { id: 'skin3', name: 'Skin #3', price: 100, img: '/skin3.svg' },
]

function readOwned(): string[] {
  try { return JSON.parse(localStorage.getItem('shop_skins_owned') || '[]') } catch { return [] }
}
function writeOwned(arr: string[]) {
  localStorage.setItem('shop_skins_owned', JSON.stringify(arr))
}
function readActive(): string | null {
  return localStorage.getItem('shop_active_skin')
}
function writeActive(id: string) {
  localStorage.setItem('shop_active_skin', id)
}

// повідомляємо інші екрани про зміну активного скіна
const notifySkin = (id: string) => {
  window.dispatchEvent(new CustomEvent('skin:changed', { detail: id }))
}

export function Profile(){
  const toast = useToast()
  const [gs, setGs] = useState(load())     // coins та username
  const [owned, setOwned] = useState<string[]>(readOwned())
  const [active, setActive] = useState<string | null>(readActive())
  const [refCode, setRefCode] = useState('')

  const myLink = useMemo(() =>
    `https://t.me/your_bot?start=${encodeURIComponent(gs.username || 'culer')}`,
    [gs.username]
  )

  // 1) Ініціалізуємо default, якщо ще не встановлено жодного
   useEffect(() => {
    const cur = localStorage.getItem('shop_active_skin')
    if (!cur) {
      localStorage.setItem('shop_active_skin', 'default')
      window.dispatchEvent(new CustomEvent('skin:changed', { detail: 'default' }))
    }
  }, [])

  // 2) Слухаємо зміну із інших вкладок
  useEffect(()=>{
    const onStorage = () => { setOwned(readOwned()); setActive(readActive()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const buy = (sk: Skin) => {
    if (owned.includes(sk.id)) return setAsActive(sk.id)
    if (gs.coins < sk.price) {
      toast({ title: 'Не вистачає монет', status: 'warning' })
      return
    }
    const newState = { ...gs, coins: gs.coins - sk.price }
    save(newState); setGs(newState)

    const nextOwned = Array.from(new Set([...owned, sk.id]))
    writeOwned(nextOwned); setOwned(nextOwned)

    writeActive(sk.id); setActive(sk.id)
    notifySkin(sk.id)
    toast({ title: `Придбано ${sk.name}`, status: 'success' })
  }

  const setAsActive = (id: string) => {
    writeActive(id); setActive(id)
    notifySkin(id)
    toast({ title: id === 'default' ? 'Увімкнено стандартний скін' : 'Скін встановлено', status: 'success' })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(myLink)
      toast({ title: 'Скопійовано', status: 'success' })
    } catch {
      const ta = document.createElement('textarea')
      ta.value = myLink; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
      toast({ title: 'Скопійовано', status: 'success' })
    }
  }

  const applyRef = ()=>{
    if (!refCode.trim()) return
    localStorage.setItem('blau_ref', refCode.trim())
    toast({ title: 'Реф-код застосовано (демо)', status: 'success' })
  }

  return (
    <Box className="screen">
      <Heading size="lg" textAlign="center" mb="2">Профіль</Heading>

      {/* Баланс + активний скін */}
      <HStack justify="space-between" mb="2">
        <HStack bg="#1e3a8a" color="white" borderRadius="12px" px="3" py="1.5" fontWeight="800" spacing={2}>
          <CoinIcon width={16} height={16} />
          <Box as="span">{gs.coins}</Box>
        </HStack>
        <HStack opacity={0.9} spacing="2">
          <Text fontSize="sm">Активний скін:</Text>
          <Badge colorScheme="yellow" variant="subtle">{active || '—'}</Badge>
          <Button size="xs" variant="outline" onClick={()=> setAsActive('default')}>
            Стандартний
          </Button>
        </HStack>
      </HStack>

      {/* Реферальне посилання */}
      <Box p="3" border="1px solid" borderColor="gray.700" borderRadius="lg" bg="#0d1117" mb="3">
        <Text fontWeight="bold" mb="1">Реферальне посилання</Text>
        <Text fontSize="sm" opacity={0.9} wordBreak="break-all" mb="2">{myLink}</Text>
        <Button size="sm" variant="outline" onClick={copyLink}>Copy</Button>
      </Box>

      {/* Ввести реф-код */}
      <Box p="3" border="1px solid" borderColor="gray.700" borderRadius="lg" bg="#0d1117" mb="4">
        <Text fontWeight="bold" mb="2">Ввести код друга</Text>
        <HStack>
          <Input value={refCode} onChange={e=>setRefCode(e.target.value)} placeholder="REF-XXXXX" />
          <Button {...yellowBtnProps} onClick={applyRef}>Застосувати</Button>
        </HStack>
      </Box>

      {/* Магазин скінів */}
      <Heading size="md" mb="2">Shop — Скіни</Heading>
      <SimpleGrid columns={2} spacing={3}>
        {SKINS.map(sk => {
          const isOwned = owned.includes(sk.id)
          const isActive = active === sk.id
          return (
            <Box
              key={sk.id}
              p="3"
              border="1px solid"
              borderColor={isActive ? '#1e3a8a' : 'gray.700'}
              borderRadius="16px"
              bg="#0d1117"
            >
              <Box borderRadius="12px" overflow="hidden" mb="2" bg="blackAlpha.400">
                <Image src={sk.img} alt={sk.name} w="100%" h="120px" objectFit="cover" />
              </Box>

              <Text fontWeight="700" noOfLines={1}>{sk.name}</Text>

              <HStack justify="space-between" mt="2" mb="2">
                <HStack bg="rgba(255,223,27,.10)" borderRadius="10px" px="2" py="1">
                  <CoinIcon width={14} height={14} />
                  <Text fontWeight="800">{sk.price}</Text>
                </HStack>

                {isOwned && (
                  <Badge variant="subtle" colorScheme={isActive ? 'blue' : 'green'}>
                    {isActive ? 'Активний' : 'Є'}
                  </Badge>
                )}
              </HStack>

              <Button
                {...yellowBtnProps}
                w="100%"
                size="sm"
                onClick={() => (isOwned ? setAsActive(sk.id) : buy(sk))}
                isDisabled={!isOwned && gs.coins < sk.price}
              >
                {isOwned ? 'Встановити' : `Купити за ${sk.price}`}
              </Button>
            </Box>
          )
        })}
      </SimpleGrid>

      {/* Майбутні товари */}
      <Box mt="4" p="3" border="1px solid" borderColor="gray.700" borderRadius="lg" bg="#0d1117">
        <Text fontWeight="bold">Скоро</Text>
        <Text fontSize="sm" opacity={0.9}>
          Додамо: шрифти для джерсі (username / номер), фони, рамки.
        </Text>
      </Box>
    </Box>
  )
}