import { useMemo, useState } from 'react'
import {
  Box, Heading, VStack, HStack, Text, Button, Badge, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  Input, useDisclosure, Divider
} from '@chakra-ui/react'
import { load, save } from '../lib/game'
import { CoinIcon, yellowBtnProps } from '../ui'

// ----------------- Моки найближчих матчів -----------------
type Match = {
  id: string
  home: string
  away: string
  date: string   // довільний рядок для демо
  comp: string   // назва турніру
}

const UPCOMING: Match[] = [
  { id: 'm1', home: 'Barcelona', away: 'Girona',   date: '20 серпня, 21:00', comp: 'LaLiga' },
  { id: 'm2', home: 'Barcelona', away: 'Villarreal', date: '27 серпня, 21:00', comp: 'LaLiga' },
  { id: 'm3', home: 'Barcelona', away: 'PSG',      date: '3 вересня, 22:00', comp: 'UCL'    },
]

// ----------------- Локальне сховище ставок -----------------
type Bet = {
  matchId: string
  home: number
  away: number
  stake: number
  potentialExact: number
  potentialResult: number
}

function readBets(): Bet[] {
  try { return JSON.parse(localStorage.getItem('blau_bets') || '[]') } catch { return [] }
}
function writeBets(bets: Bet[]) {
  localStorage.setItem('blau_bets', JSON.stringify(bets))
}
function findBet(id: string) {
  return readBets().find(b => b.matchId === id)
}

// ----------------- Допоміжні -----------------
function outcome(h: number, a: number): 'home'|'away'|'draw' {
  if (h === a) return 'draw'
  return h > a ? 'home' : 'away'
}

// ----------------- Модалка прогнозу -----------------
function PredictModal({
  match, isOpen, onClose, onPlaced,
}: {
  match: Match
  isOpen: boolean
  onClose: () => void
  onPlaced: (bet: Bet) => void
}) {
  const [st, setSt] = useState(load())
  const [home, setHome] = useState('0')
  const [away, setAway] = useState('0')
  const [stake, setStake] = useState('0')

  const h = Math.max(0, Number(home) || 0)
  const a = Math.max(0, Number(away) || 0)
  const s = Math.max(0, Number(stake) || 0)

  const picked = outcome(h, a)
  const potentialExact   = Math.floor(s * 3)
  const potentialResult  = Math.floor(s * 1.5)

  const place = () => {
    if (s <= 0) return
    if (s > st.coins) return alert('Не вистачає монет')
    const newState = { ...st, coins: st.coins - s }
    save(newState); setSt(newState)

    const bet: Bet = {
      matchId: match.id,
      home: h,
      away: a,
      stake: s,
      potentialExact,
      potentialResult,
    }
    const all = readBets()
    if (all.some(b => b.matchId === match.id)) {
      onClose(); return
    }
    all.push(bet); writeBets(all)
    onPlaced(bet)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0,0,0,.6)" backdropFilter="blur(2px)" />
      <ModalContent
        bg="#0f111a"
        borderWidth="1px"
        borderColor="rgba(255,255,255,.08)"
        borderRadius="24px"
        boxShadow="0 20px 80px rgba(0,0,0,.6)"
        px="4" pt="4" pb="3"
        mx="4" maxW="420px" w="calc(100% - 32px)"
      >
        <ModalHeader fontWeight="900">Прогноз: {match.home} — {match.away}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" opacity={0.9}>
              <Text>{match.comp}</Text>
              <Text>{match.date}</Text>
            </HStack>

            {/* Ввід рахунку */}
            <HStack spacing={3}>
              <Box flex="1">
                <Text fontSize="sm" mb="1">{match.home}</Text>
                <Input value={home} onChange={e=>setHome(e.target.value)} inputMode="numeric" />
              </Box>
              <Heading size="md" pt="5">:</Heading>
              <Box flex="1">
                <Text fontSize="sm" mb="1">{match.away}</Text>
                <Input value={away} onChange={e=>setAway(e.target.value)} inputMode="numeric" />
              </Box>
            </HStack>

            {/* Ставка */}
            <Box>
              <Text fontSize="sm" mb="1">Ставка (монет)</Text>
              <Input value={stake} onChange={e=>setStake(e.target.value)} inputMode="numeric" />
            </Box>

            <Divider borderColor="rgba(255,255,255,.08)"/>

            {/* Розрахунки */}
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between" p="3" bg="#111626" borderRadius="16px" border="1px solid" borderColor="rgba(255,255,255,.08)">
                <Text>Потенціал (точний рахунок)</Text>
                <HStack>
                  <CoinIcon width={16} height={16} />
                  <Text fontWeight="800">{isFinite(potentialExact) ? potentialExact : 0}</Text>
                </HStack>
              </HStack>
              <HStack justify="space-between" p="3" bg="#111626" borderRadius="16px" border="1px solid" borderColor="rgba(255,255,255,.08)">
                <Text>Потенціал (правильний результат)</Text>
                <HStack>
                  <CoinIcon width={16} height={16} />
                  <Text fontWeight="800">{isFinite(potentialResult) ? potentialResult : 0}</Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" opacity={0.7}>
                ×3 за точний рахунок; ×1.5 — якщо вгадано переможця або нічию, але не точний рахунок.
              </Text>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt="2">
          <Button variant="outline" mr="2" onClick={onClose}>Скасувати</Button>
          <Button {...yellowBtnProps} onClick={place}>Поставити</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ----------------- Банер матчу -----------------
function MatchCard({
  m, disabled, onClick,
}: {
  m: Match
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <Box
      p="3"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="lg"
      bg="#0d1117"
      opacity={disabled ? 0.45 : 1}
      cursor={disabled ? 'default' : 'pointer'}
      onClick={disabled ? undefined : onClick}
    >
      <HStack justify="space-between" align="center">
        {/* «Лого» як емоджі-кружечки */}
        <HStack minW="80px" justify="flex-start">
          <Text fontSize="xl">🔵</Text>
          <Text>{m.home}</Text>
        </HStack>

        <VStack spacing={0} textAlign="center">
          <Text fontWeight="bold">{m.comp}</Text>
          <Text opacity={0.8} fontSize="sm">{m.date}</Text>
        </VStack>

        <HStack minW="80px" justify="flex-end">
          <Text>{m.away}</Text>
          <Text fontSize="xl">🔴</Text>
        </HStack>
      </HStack>

      {disabled && (
        <HStack mt="2" justify="flex-end">
          <Badge variant="subtle" colorScheme="yellow">Ставку зроблено</Badge>
        </HStack>
      )}
    </Box>
  )
}

// ----------------- Основна сторінка -----------------
export function Predict() {
  const [coinsState, setCoinsState] = useState(load()) // лише щоб перерендерити баланс у шапці, якщо потрібно
  const [active, setActive] = useState<Match | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const placed = useMemo(() => {
    const map = new Map<string, Bet>()
    for (const b of readBets()) map.set(b.matchId, b)
    return map
  }, [/* оновиться при mount; для live-апдейту можна додати state-сигнал */])

  const openMatch = (m: Match) => { setActive(m); onOpen() }
  const onPlaced = (_bet: Bet) => {
    // оновимо coins у верхніх компонентах (якщо відображається)
    setCoinsState(load())
  }

  return (
    <Box className="screen">
      <Heading size="lg" textAlign="center" mb="2">Predict</Heading>

      <VStack align="stretch" spacing={3}>
        {UPCOMING.map(m => (
          <MatchCard
            key={m.id}
            m={m}
            disabled={!!placed.get(m.id)}
            onClick={() => openMatch(m)}
          />
        ))}
      </VStack>

      {active && (
        <PredictModal
          match={active}
          isOpen={isOpen}
          onClose={onClose}
          onPlaced={onPlaced}
        />
      )}
    </Box>
  )
}