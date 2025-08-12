// src/screens/Profile.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Box, Heading, Text, HStack, Button, Input, Image,
  useToast, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react'
import { ChevronDown, Check } from 'lucide-react'
import { load, save } from '../lib/game'
import { yellowBtnProps, CoinIcon } from '../ui'

// ===== ДЕМО-СКІНИ (картинки поклади у /public або /assets) =====
type Skin = { id: string; name: string; price: number; img: string }
const SKINS: Skin[] = [
  { id: 'skin1', name: 'Skin #1', price: 100, img: '/skin1.svg' },
  { id: 'skin2', name: 'Skin #2', price: 100, img: '/skin2.svg' },
  { id: 'skin3', name: 'Skin #3', price: 100, img: '/skin3.svg' },
]

// ===== helpers для LocalStorage =====
const OWNED_KEY = 'shop_skins_owned'
const ACTIVE_KEY = 'shop_active_skin'

function readOwned(): string[] {
  try { return JSON.parse(localStorage.getItem(OWNED_KEY) || '[]') } catch { return [] }
}
function writeOwned(arr: string[]) { localStorage.setItem(OWNED_KEY, JSON.stringify(arr)) }
function readActive(): string | null { return localStorage.getItem(ACTIVE_KEY) }
function writeActive(id: string) { localStorage.setItem(ACTIVE_KEY, id) }
const notifySkin = (id: string) =>
  window.dispatchEvent(new CustomEvent('skin:changed', { detail: id }))

export default function Profile() {
  const toast = useToast()
  const [gs, setGs] = useState(load())
  const [owned, setOwned] = useState<string[]>(readOwned())
  const [active, setActive] = useState<string | null>(readActive())

  // Реферальне посилання (підстав свій бот)
  const myLink = useMemo(
    () => `https://t.me/your_bot?start=${encodeURIComponent(gs.username || 'culer')}`,
    [gs.username]
  )

  // Гарантуємо наявність default активного
  useEffect(() => {
    if (!readActive()) {
      writeActive('default')
      setActive('default')
      notifySkin('default')
    }
  }, [])

  // Слухаємо зміни з інших вкладок
  useEffect(() => {
    const onStorage = () => { setOwned(readOwned()); setActive(readActive()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(myLink)
      toast({ title: 'Посилання скопійовано', status: 'success' })
    } catch {
      const ta = document.createElement('textarea')
      ta.value = myLink; document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
      toast({ title: 'Посилання скопійовано', status: 'success' })
    }
  }

  const setAsActive = (id: string) => {
    writeActive(id)
    setActive(id)
    notifySkin(id)
    toast({ title: 'Скін активовано', status: 'success' })
  }

  const buy = (sk: Skin) => {
    if (owned.includes(sk.id)) return
    if (gs.coins < sk.price) {
      toast({ title: 'Не вистачає монет', status: 'warning' })
      return
    }
    const nextGs = { ...gs, coins: gs.coins - sk.price }
    save(nextGs); setGs(nextGs)

    const nextOwned = Array.from(new Set([...owned, sk.id]))
    writeOwned(nextOwned); setOwned(nextOwned)

    setAsActive(sk.id)
    toast({ title: `Куплено ${sk.name}`, status: 'success' })
  }

  // Дропдаун: default + куплені
  const ownedForMenu = ['default', ...owned.filter((v, i, a) => a.indexOf(v) === i)]

  return (
    <Box className="screen">
      <Heading size="lg" textAlign="center" mb="2">Профіль</Heading>

      {/* Баланс + Change skin */}
      <HStack justify="space-between" mb="3">
        <HStack
          bg="#1e3a8a" color="white" borderRadius="12px"
          px="3" py="1.5" fontWeight="800" spacing={2}
        >
          <CoinIcon width={16} height={16} />
          <Box as="span">{gs.coins}</Box>
        </HStack>

        <Menu>
          <MenuButton
            as={Button}
            size="sm"
            rightIcon={<ChevronDown size={16} />}
            bg="#2563eb"                 // синя кнопка
            color="white"
            _hover={{ bg: '#1d4ed8' }}
            _active={{ bg: '#1d4ed8' }}
            borderRadius="10px"
            fontWeight="600"
            px="14px"
          >
            Change skin
          </MenuButton>

          <MenuList
            bg="#0f172a"                 // темне меню
            color="white"
            border="1px solid rgba(255,255,255,.08)"
            boxShadow="0 12px 40px rgba(0,0,0,.45)"
            p="1"
            maxH="260px"
            overflowY="auto"
            sx={{
              '::-webkit-scrollbar': { width: '6px' },
              '::-webkit-scrollbar-thumb': { background: '#475569', borderRadius: '4px' },
              '::-webkit-scrollbar-track': { background: 'transparent' },
            }}
          >
            {ownedForMenu.map(id => {
              const label = id === 'default' ? 'Default' : id
              const isActive = active === id
              return (
                <MenuItem
                  key={id}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: '#1e293b' }}
                  _focus={{ bg: '#1e293b' }}
                  onClick={() => setAsActive(id)}
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  borderRadius="8px"
                  fontWeight="500"
                >
                  <Text>{label}</Text>
                  {isActive && <Box as={Check} size="16px" ml="auto" color="#22c55e" />}
                </MenuItem>
              )
            })}
          </MenuList>
        </Menu>
      </HStack>

      {/* Реферальне посилання */}
      <Box p="3" border="1px solid" borderColor="gray.700" borderRadius="lg" bg="#0d1117" mb="3">
        <Text fontWeight="bold" mb="2">Реферальне посилання</Text>
        <HStack>
          <Input value={myLink} isReadOnly bg="blackAlpha.400" />
          <Button {...yellowBtnProps} onClick={copyLink}>Copy</Button>
        </HStack>
      </Box>

      {/* Shop — горизонтальний слайдер карток */}
      <Heading size="md" mb="2">Shop — Скіни</Heading>

      <Box
        overflowX="auto"
        whiteSpace="nowrap"
        pr="2"
        sx={{
          scrollSnapType: 'x mandatory',
          // приховано скролбар на iOS/Android і десктопі
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <HStack spacing="3" align="stretch" minW="100%" w="max-content">
          {SKINS.map(sk => {
            const isOwned = owned.includes(sk.id)
            const isActive = active === sk.id

            return (
              <Box
                key={sk.id}
                display="inline-block"
                minW="190px"
                maxW="190px"
                scrollSnapAlign="start"
                border="1px solid"
                borderColor={isActive ? '#1e3a8a' : 'gray.700'}
                borderRadius="16px"
                bg="#0d1117"
                overflow="hidden"
              >
                <Box position="relative" h="140px" bg="blackAlpha.400">
                  <Image src={sk.img} alt={sk.name} w="100%" h="100%" objectFit="cover" />

                  {/* Ціна на зображенні (якщо ще не куплено) */}
                  {!isOwned && (
                    <HStack
                      position="absolute"
                      top="8px"
                      left="8px"
                      bg="rgba(255,223,27,.95)"
                      color="#0b0b0b"
                      borderRadius="10px"
                      px="2"
                      py="1"
                      spacing="1"
                    >
                      <CoinIcon width={14} height={14} />
                      <Text fontWeight="800" fontSize="sm">{sk.price}</Text>
                    </HStack>
                  )}

                  {/* Статус куплено */}
                  {isOwned && (
                    <Box position="absolute" top="8px" right="8px" fontSize="18px">✅</Box>
                  )}
                </Box>

                <Box p="3">
                  <Text fontWeight="700" noOfLines={1} mb="2">
                    {sk.name}
                  </Text>

                  {/* Кнопки: якщо куплено — нічого; якщо ні — “Купити” */}
                  {!isOwned ? (
                    <Button {...yellowBtnProps} w="100%" size="sm" onClick={() => buy(sk)}>
                      Купити
                    </Button>
                  ) : null}
                </Box>
              </Box>
            )
          })}
        </HStack>
      </Box>

      {/* Підказка */}
      <Box mt="4" p="3" border="1px solid" borderColor="gray.700" borderRadius="lg" bg="#0d1117">
        <Text fontWeight="bold">Скін-менеджмент</Text>
        <Text fontSize="sm" opacity={0.9}>
          Щоб увімкнути куплений скін — натисни <b>Change skin</b> і вибери зі списку.
        </Text>
      </Box>
    </Box>
  )
}
