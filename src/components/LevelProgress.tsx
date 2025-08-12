import { Box, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export function LevelProgress({ xp, need }:{ xp:number; need:number }) {
  const pct = Math.max(0, Math.min(100, Math.floor((xp / Math.max(need,1)) * 100)))

  return (
    <Box
      position="relative"
      w="100%"
      p="10px"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="16px"
      bg="#0d1117"
      overflow="hidden"
    >
      
      {/* Бар прогресу з м’яким блиском і сяйвом */}
      <Box position="relative" h="14px" borderRadius="999px" bg="rgba(255,255,255,.05)" overflow="hidden">
        <MotionBox
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          h="100%"
          borderRadius="999px"
          // градієнт + внутрішній highlight + зовнішній glow
          sx={{
            background:
              'linear-gradient(90deg, #ffdf1b 0%, #ffd800 50%, #ffdf1b 100%)',
            boxShadow: '0 0 26px rgba(255,223,27,.45)',
            position: 'relative',
          }}
        >
          {/* легкий «shine» що їде по бару */}
          <MotionBox
            position="absolute"
            top="-40%"
            left="-10%"
            width="30%"
            height="180%"
            borderRadius="16px"
            rotate="25deg"
            bg="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 100%)"
            initial={{ x: '-30%' }}
            animate={{ x: '160%' }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
            pointerEvents="none"
          />
        </MotionBox>
      </Box>

      {/* Текст підпису */}
      <HStack mt="8px" justify="space-between" fontSize="sm" opacity={0.9}>
        <Text>Прогрес рівня</Text>
        <Text>{xp}/{need} ({pct}%)</Text>
      </HStack>
    </Box>
  )
}