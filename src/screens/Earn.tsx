import { useEffect, useRef, useState } from 'react'
import {
  Box, Heading, VStack, HStack, Text, Button, IconButton, AspectRatio, Image,
} from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { load, save } from '../lib/game'
import { yellowBtnProps, CoinIcon } from '../ui'

// картинки з assets
import ads1 from '../assets/promo1.jpg'
import ads2 from '../assets/promo2.jpg'

type Task = { id: string; title: string; reward: number; done: boolean }

const initial: Task[] = [
  { id: 'tg_sub', title: 'Підписатися на Blaugranes канал', reward: 500, done: false },
  { id: 'yt_sub', title: 'Підписатися на YouTube', reward: 800, done: false },
  { id: 'guess',  title: 'Відгадай гравця по фото', reward: 700, done: false },
]

export function Earn() {
  const [st, setSt] = useState(load())
  const [tasks, setTasks] = useState<Task[]>(
    JSON.parse(localStorage.getItem('blau_tasks') || 'null') || initial
  )

  // --- Слайдер ---
  const slides = [ads1, ads2]
  const [idx, setIdx] = useState(0)

  const go = (i: number) => setIdx((cur) => (i + slides.length) % slides.length)
  const prev = () => go(idx - 1)
  const next = () => go(idx + 1)

  // Автоплей з паузою при взаємодії
  const timerRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const resetAutoplay = () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      if (!pausedRef.current) next()
    }, 3500)
  }

  useEffect(() => {
    resetAutoplay()
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Swipe (touch)
  const startX = useRef(0)
  const distX = useRef(0)

  const onTouchStart = (e: React.TouchEvent) => {
    pausedRef.current = true
    startX.current = e.touches[0].clientX
    distX.current = 0
  }
  const onTouchMove = (e: React.TouchEvent) => {
    distX.current = e.touches[0].clientX - startX.current
  }
  const onTouchEnd = () => {
    const THRESHOLD = 40 // px
    if (Math.abs(distX.current) > THRESHOLD) {
      if (distX.current < 0) next()
      else prev()
    }
    pausedRef.current = false
  }

  // Навігація клавішами (за потреби в десктопі)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  const claim = (id: string) => {
    const t = tasks.find(x => x.id === id); if (!t || t.done) return
    const ns = { ...st, coins: st.coins + t.reward }; save(ns); setSt(ns)
    const nt = tasks.map(x => x.id === id ? { ...x, done: true } : x)
    setTasks(nt); localStorage.setItem('blau_tasks', JSON.stringify(nt))
  }

  return (
    <Box className="screen">
      {/* Заголовок по центру */}
      <Heading size="lg" textAlign="center" mb="2">Earn</Heading>

      {/* Квадратний слайдер із заокругленими кутами */}
      <Box position="relative" w="100%" maxW="520px" mx="auto" mb="4">
        <AspectRatio
          ratio={1}
          borderRadius="20px"
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Box
            position="relative"
            w="100%"
            h="100%"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
          >
            {/* трек */}
            <Box
              display="flex"
              w={`${slides.length * 100}%`}
              h="100%"
              transform={`translateX(-${idx * 100}%)`}
              transition="transform .45s ease"
            >
              {slides.map((src, i) => (
                <Box key={i} flex="0 0 100%" h="100%">
                  <Image src={src} alt={`ad-${i + 1}`} w="100%" h="100%" objectFit="cover" />
                </Box>
              ))}
            </Box>
          </Box>
        </AspectRatio>

        {/* навігація */}
        <IconButton
          aria-label="prev" icon={<ChevronLeft size={20} />} size="sm"
          position="absolute" top="50%" left="8px" transform="translateY(-50%)"
          onClick={() => { prev(); resetAutoplay() }} variant="ghost"
        />
        <IconButton
          aria-label="next" icon={<ChevronRight size={20} />} size="sm"
          position="absolute" top="50%" right="8px" transform="translateY(-50%)"
          onClick={() => { next(); resetAutoplay() }} variant="ghost"
        />

        {/* доти (клікабельні) */}
        <HStack spacing="1.5" position="absolute" bottom="10px" w="100%" justify="center">
          {slides.map((_, i) => (
            <Box
              key={i}
              as="button"
              onClick={() => { go(i); resetAutoplay() }}
              w={i === idx ? '10px' : '8px'}
              h="8px"
              borderRadius="999px"
              bg={i === idx ? 'white' : 'whiteAlpha.600'}
              opacity={i === idx ? 1 : 0.8}
              transition="all .2s ease"
            />
          ))}
        </HStack>
      </Box>

      {/* Список задач */}
      <VStack align="stretch" spacing={3}>
        {tasks.map(t => (
          <HStack
            key={t.id}
            p="3"
            borderWidth="1px"
            borderColor="gray.700"
            borderRadius="lg"
            bg="#0d1117"
            justify="space-between"
            align="center"
          >
            <Text pr="2">{t.title}</Text>

            <HStack spacing="3">
              {/* Бейдж винагороди */}
              <HStack
                bg="rgba(255,223,27,.10)"
                borderRadius="12px"
                px="12px"
                py="7px"
                minW="96px"
                justify="center"
                spacing="6px"
              >
                <CoinIcon width={16} height={16} />
                <Text fontWeight="bold" lineHeight="1">{t.reward}</Text>
              </HStack>

              {/* Кнопка */}
              <Button
                {...yellowBtnProps}
                size="sm"
                fontSize="sm"
                px="12px"
                py="9px"
                onClick={() => claim(t.id)}
                isDisabled={t.done}
              >
                {t.done ? 'Забрано' : 'Отримати'}
              </Button>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  )
}
