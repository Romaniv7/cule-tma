import { useMemo } from 'react'
import {
  Box, Heading, VStack, HStack, Text,
  Tabs, TabList, Tab, TabPanels, TabPanel, Badge
} from '@chakra-ui/react'
import { load } from '../lib/game'
import { CoinIcon } from '../ui'

type Row = { name: string; value: number }
type Ranked = Row & { rank: number }

const GOLD   = 'rgba(255,223,27,.12)'
const SILVER = 'rgba(192,196,214,.12)'
const BRONZE = 'rgba(205,127,50,.12)'
const ME_BG  = 'rgba(30,58,138,.18)'

const NOTE_OVERALL   = 'Демо: 1 місце — $1000, 2 місце — $500, 3 місце — $300.'
const NOTE_MONTHLY   = 'Демо: щомісячні призи — 1 місце $300, 2 — $150, 3 — $100.'
const NOTE_REFERRALS = 'Демо: за рефералів — 1 місце $200, 2 — $100, 3 — $50.'

// ---- демо-дані
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

// топ-10 + мій рядок (якщо поза топом)
function rankify(source: Row[], meName: string, meValue: number) {
  const arr = [...source]
  const i = arr.findIndex(r => r.name === meName)
  if (i >= 0) arr[i] = { name: meName, value: Math.max(arr[i].value, meValue) }
  else if (meName) arr.push({ name: meName, value: meValue })

  arr.sort((a,b)=>b.value-a.value)
  const ranked: Ranked[] = arr.map((r,idx)=>({ ...r, rank: idx+1 }))
  const top10 = ranked.slice(0,10)
  const me = ranked.find(r=>r.name===meName) || null
  return { top10, me: me && me.rank>10 ? me : null }
}

function TopMedal({ rank }: { rank: number }) {
  if (rank===1) return <span>🥇</span>
  if (rank===2) return <span>🥈</span>
  if (rank===3) return <span>🥉</span>
  return null
}

function RowItem({ r, highlight = false }: { r: Ranked; highlight?: boolean }) {
  let bg = '#0d1117', border = 'gray.700'
  if (r.rank === 1) { bg = 'rgba(255,223,27,.12)'; border = 'rgba(255,223,27,.35)' }
  else if (r.rank === 2) { bg = 'rgba(192,196,214,.12)'; border = 'rgba(192,196,214,.35)' }
  else if (r.rank === 3) { bg = 'rgba(205,127,50,.12)'; border = 'rgba(205,127,50,.35)' }
  if (highlight) { bg = '#13213d'; border = '#1e3a8a' }

  return (
    <HStack
      p="1"                               // було 2
      borderWidth="1px"
      borderColor={border}
      borderRadius="12px"
      bg={bg}
      justify="space-between"
      align="center"
      spacing="1"
      minH="32px"                         // було 36/46
    >
      <HStack spacing="1">
        <Badge
          px="1.5" py="0.5"
          borderRadius="10px"
          bg="yellow.300" color="#0b0b0b" fontWeight="900"
          minW="24px" textAlign="center"
          sx={{ fontSize: '10px !important' }} // badge цифра менша
        >
          {r.rank}
        </Badge>

        <HStack spacing="1">
          <Text
            fontWeight={highlight ? '800' : (r.rank <= 3 ? '700' : '600')}
            sx={{ fontSize: '12px !important', lineHeight: '1.1' }} // ім’я менше
          >
            {r.name}
          </Text>
          <TopMedal rank={r.rank} />
        </HStack>
      </HStack>

      <HStack spacing="1.5">
        <CoinIcon width={12} height={12} />          {/* було 14 */}
        <Text fontWeight="800" sx={{ fontSize: '12px !important', lineHeight: '1.1' }}>
          {r.value}
        </Text>
      </HStack>
    </HStack>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
      <Box
    mb="1"
    px="2"
    py="1.5"
    borderWidth="1px"
    borderColor="gray.700"
    borderRadius="12px"
    bg="#0d1117"
    sx={{ fontSize: '12px !important' }}   // менший текст
  >
    {children}
  </Box>
  )
}

function Board({ data, meName, meValue, note }: {
  data: Row[]; meName: string; meValue: number; note: string
}) {
  const { top10, me } = useMemo(()=>rankify(data, meName, meValue), [data, meName, meValue])

  // висота нижньої навігації (≈80) + safe-area
  const bottomOffset = `calc(84px + env(safe-area-inset-bottom))`

  return (
    <Box position="relative">
      <Note>{note}</Note>

      {/* Топ-10 — компактний список */}
      <VStack align="stretch" spacing="1" pb="72px">
        {top10.map(r => (<RowItem key={r.rank+r.name} r={r}/>))}
      </VStack>

      {/* Мій рядок: фіксована плашка над нижнім меню (без скролу) */}
      {me && (
        <Box
          position="fixed"
          left="0" right="0"
          bottom={bottomOffset}
          px="16px"
          zIndex={5}
        >
          <RowItem r={me} highlight />
        </Box>
      )}
    </Box>
  )
}

export function Leaderboard() {
  const me = load()
  const meName = me.username || 'you'
  const totalCoins   = me.coins || 0
  const monthlyCoins = Math.min(totalCoins, Math.floor(totalCoins*0.3)) // демо
  const refCount     = Number(localStorage.getItem('blau_refs') || '0')

  return (
    <Box className="screen">
      <Heading size="lg" textAlign="center" mb="2">Leaderboard</Heading>

      <Tabs variant="soft-rounded" colorScheme="blue" isFitted size="xs">
        <TabList
          bg="#0d1117" borderWidth="1px" borderColor="gray.700"
          borderRadius="lg" p="0.5" mb="2"
        >
          <Tab _selected={{ bg:'rgba(30,58,138,.25)', color:'white' }} fontWeight="700">Загальний</Tab>
          <Tab _selected={{ bg:'rgba(30,58,138,.25)', color:'white' }} fontWeight="700">Місяць</Tab>
          <Tab _selected={{ bg:'rgba(30,58,138,.25)', color:'white' }} fontWeight="700">Реферали</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px="0">
            <Board data={demoOverall}   meName={meName} meValue={totalCoins}   note={NOTE_OVERALL}/>
          </TabPanel>
          <TabPanel px="0">
            <Board data={demoMonthly}   meName={meName} meValue={monthlyCoins} note={NOTE_MONTHLY}/>
          </TabPanel>
          <TabPanel px="0">
            <Board data={demoReferrals} meName={meName} meValue={refCount}    note={NOTE_REFERRALS}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
