import { useEffect, useState } from 'react'
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
  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length)
  const next = () => setIdx(i => (i + 1) % slides.length)

  // автоперемикання можна додати пізніше

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
        <AspectRatio ratio={1} borderRadius="20px" overflow="hidden"
          border="1px solid" borderColor="gray.700">
          <Box position="relative" w="100%" h="100%">
            {/* трек */}
            <Box display="flex" w={`${slides.length * 100}%`}
                 h="100%"
                 transform={`translateX(-${idx * (100 / slides.length)}%)`}
                 transition="transform .45s ease">
              {slides.map((src, i) => (
                <Box key={i} flex="0 0 100%" h="100%">
                  <Image src={src} alt={`ad-${i+1}`} w="100%" h="100%" objectFit="cover" />
                </Box>
              ))}
            </Box>
          </Box>
        </AspectRatio>

        {/* навігація */}
        <IconButton
          aria-label="prev" icon={<ChevronLeft size={20} />} size="sm"
          position="absolute" top="50%" left="8px" transform="translateY(-50%)"
          onClick={prev} variant="ghost"
        />
        <IconButton
          aria-label="next" icon={<ChevronRight size={20} />} size="sm"
          position="absolute" top="50%" right="8px" transform="translateY(-50%)"
          onClick={next} variant="ghost"
        />

        {/* доти */}
        <HStack spacing="1" position="absolute" bottom="10px" w="100%" justify="center">
          {slides.map((_, i) => (
            <Box key={i} w="8px" h="8px" borderRadius="999px"
                 bg={i === idx ? 'white' : 'whiteAlpha.500'} />
          ))}
        </HStack>
      </Box>

      {/* Список задач */}
      <VStack align="stretch" spacing={3}>
        {tasks.map(t => (
          <HStack key={t.id}
            p="3"
            border="1px solid" borderColor="gray.700"
            borderRadius="lg" bg="#0d1117"
            justify="space-between" align="center">
            <Text pr="2">{t.title}</Text>

            <HStack spacing="3">
              {/* Бейдж винагороди — збільшені падінги та мін. ширина */}
              <HStack
                bg="rgba(255,223,27,.10)"
                borderRadius="12px"
                px="12px" py="7px"
                minW="96px"
                justify="center"
                spacing="6px"
              >
                <CoinIcon width={16} height={16} />
                <Text fontWeight="bold" lineHeight="1">{t.reward}</Text>
              </HStack>

              {/* Кнопка меншого кеглю */}
              <Button
                {...yellowBtnProps}
                size="sm"
                fontSize="sm"
                px="12px" py="9px"
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