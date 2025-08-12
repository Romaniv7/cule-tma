// src/screens/Leaderboard.tsx
import { useMemo } from 'react'
import {
  Box, Heading, VStack, HStack, Text,
  Tabs, TabList, Tab, TabPanels, TabPanel, Badge
} from '@chakra-ui/react'
import { load } from '../lib/game'
import { CoinIcon, CULE_YELLOW } from '../ui'

type Row = { name: string; value: number }

const GOLD   = 'rgba(255,223,27,.12)'
const SILVER = 'rgba(192,196,214,.12)'
const BRONZE = 'rgba(205,127,50,.12)'
const HILITE = 'rgba(30,58,138,.18)' // підсвітка для свого рядка

const CONDITIONS = {
  overall: 'Демо: 1 місце — $1000, 2 місце — $500, 3 місце — $300.',
  monthly: 'Демо: щомісячні призи — 1 місце $300, 2 — $150, 3 — $100.',
  referrals: 'Демо: за рефералів — 1 місце $200, 2 — $100, 3 — $50.',
}

// ===== ДЕМО-ДАНІ (тимчасово) =====
const demoOverall: Row[] = [
  { name:'leo',   value: 9200 }, { name:'xavi',  value: 7800 }, { name:'gavi',  value: 6100 },
  { name:'ansu',  value: 5400 }, { name:'pedri', value: 5200 }, { name:'sergi', value: 4800 },
  { name:'ney',   value: 4700 }, { name:'ter',   value: 4600 }, { name:'ron',   value: 4500 },
  { name:'and',   value: 4400 }, { name:'culer-101', value: 1200 }, { name:'culer-219', value: 900 },
  { name:'culer-153', value: 1337 },
]
const demoMonthly: Row[] = [
  { name:'leo', value: 2100 }, { name:'xavi', value: 1980 }, { name:'gavi', value: 1820 },
  { name:'ansu', value: 1600 }, { name:'pedri', value: 1580 }, { name:'sergi', value: 1520 },
  { name:'ney', value: 1410 }, { name:'ter', value: 1380 }, { name:'ron', value: 1290 }, { name:'and', value: 1200 },
  { name:'culer-153', value: 260 },
]
const demoReferrals: Row[] = [
  { name:'leo', value: 42 }, { name:'xavi', value: 35 }, { name:'gavi', value: 28 },
  { name:'ansu', value: 22 }, { name:'pedri', value: 19 }, { name:'sergi', value: 17 },
  { name:'ney', value: 16 }, { name:'ter', value: 15 }, { name:'ron', value: 12 }, { name:'and', value: 10 },
  { name:'culer-153', value: 3 },
]

// Вертає top10 + твій рядок, якщо ти поза топом
function rankify(source: Row[], meName: string, meValue: number) {
  const map = new Map<string, number>()
  for (const r of source) map.set(r.name, r.value)
  if (meName) map.set(meName, Math.max(meValue, map.get(meName) ?? 0))

  const all = Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  all.sort((a, b) => b.value - a.value)

  const top = all.slice(0, 10)
  const meIndex = all.findIndex(r => r.name === meName)
  const myRow = meIndex >= 10 ? { rank: meIndex + 1, ...all[meIndex] } : null

  return { top: top.map((r, i) => ({ rank: i + 1, ...r })), myRow }
}

function TopEmoji({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>
  if (rank === 2) return <span>🥈</span>
  if (rank === 3) return <span>🥉</span>
  return null
}

function RowItem({
  rank, name, value, highlight = false,
}: { rank: number; name: string; value: number; highlight?: boolean }) {
  // компактні відступи та кеглі
  let bg = '#0d1117', border = 'gray.700'
  if (rank === 1) { bg = GOLD; border = 'rgba(255,223,27,.35)' }
  else if (rank === 2) { bg = SILVER; border = 'rgba(192,196,214,.35)' }
  else if (rank === 3) { bg = BRONZE; border = 'rgba(205,127,50,.35)' }
  if (highlight) { bg = HILITE; border = '#1e3a8a' }

  return (
    <HStack
      p="2"                 // було більше
      border="1px solid"
      borderColor={border}
      borderRadius="12px"
      bg={bg}
      justify="space-between"
      align="center"
      spacing="2"           // було більше
      minH="48px"           // щільний, але читабельний рядок
    >
      <HStack spacing="2">
        <Badge
          px="2"
          py="0.5"
          borderRadius="10px"
          bg={CULE_YELLOW}
          color="#0b0b0b"
          fontWeight="900"
          minW="30px"
          textAlign="center"
          fontSize="sm"
        >
          {rank}
        </Badge>

        <HStack spacing="1.5">
          <Text fontWeight={highlight ? '800' : (rank <= 3 ? '700' : '600')} fontSize="sm">
            {name}
          </Text>
          <TopEmoji rank={rank} />
        </HStack>
      </HStack>

      <HStack spacing="1.5">
        <CoinIcon width={14} height={14} />
        <Text fontWeight="800" fontSize="sm">{value}</Text>
      </HStack>
    </HStack>
  )
}

function InfoNote({ text }: { text: string }) {
  return (
    <Box
      mb="2"            // менший відступ
      px="3"
      py="2"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="12px"
      bg="#0d1117"
      fontSize="sm"
      opacity={0.9}
    >
      {text}
    </Box>
  )
}

function Board({
  data, meName, meValue, note,
}: { data: Row[]; meName: string; meValue: number; note: string }) {
  const { top, myRow } = useMemo(() => rankify(data, meName, meValue), [data, meName, meValue])

  return (
    <Box>
      <InfoNote text={note} />
      <VStack align="stretch" spacing="2"> {/* щільніше між рядками */}
        {top.map(r => (
          <RowItem key={r.rank + r.name} rank={r.rank} name={r.name} value={r.value} />
        ))}
        {myRow && (
          <RowItem
            rank={myRow.rank}
            name={myRow.name}
            value={myRow.value}
            highlight
          />
        )}
      </VStack>
    </Box>
  )
}

export function Leaderboard() {
  const me = load()
  const meName = me.username || 'you'
  const meOverall = me.coins || 0
  const meMonthly   = Math.min(meOverall,  Math.floor(meOverall * 0.3)) // демо
  const meReferrals = Number(localStorage.getItem('blau_refs') || '0')

  return (
    <Box className="screen">
      <Heading size="lg" textAlign="center" mb="2">Leaderboard</Heading>

      <Tabs variant="soft-rounded" colorScheme="blue" isFitted size="sm">
        <TabList
          bg="#0d1117"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="lg"
          p="1"
          mb="3"
        >
          <Tab _selected={{ bg: 'rgba(30,58,138,.25)', color: 'white' }} fontWeight="700">Загальний</Tab>
          <Tab _selected={{ bg: 'rgba(30,58,138,.25)', color: 'white' }} fontWeight="700">Місяць</Tab>
          <Tab _selected={{ bg: 'rgba(30,58,138,.25)', color: 'white' }} fontWeight="700">Реферали</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px="0">
            <Board data={demoOverall}   meName={meName} meValue={meOverall}   note={CONDITIONS.overall} />
          </TabPanel>
          <TabPanel px="0">
            <Board data={demoMonthly}   meName={meName} meValue={meMonthly}   note={CONDITIONS.monthly} />
          </TabPanel>
          <TabPanel px="0">
            <Board data={demoReferrals} meName={meName} meValue={meReferrals} note={CONDITIONS.referrals} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
