// src/components/JerseyCard.tsx
import { Box, Heading, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { SKINS } from '../skins'
const MotionBox = motion(Box)

export function JerseyCard({
  username,
  level,
  onTap,
  activeSkinId,
}: {
  username: string
  level: number
  onTap: (e: React.MouseEvent<HTMLDivElement>) => void
  activeSkinId?: string
}) {
  const grana = '#8B1C3D'
  const blau  = '#1E3A8A'

  let localSkinId: string | null = null
  if (typeof window !== 'undefined') {
    try {
      localSkinId = localStorage.getItem('shop_active_skin')
    } catch {
      localSkinId = null
    }
  }
  const effectiveSkinId = activeSkinId ?? localSkinId ?? 'default'
  const skinUrl = SKINS[effectiveSkinId] ?? ''

  // якщо є скін — показуємо лише його; якщо ні — базовий фон
  const backgroundImage = skinUrl
    ? `url("${skinUrl}")`
    : `
        linear-gradient(90deg, ${grana} 0% 50%, ${blau} 50% 100%),
        radial-gradient(120% 120% at 50% 40%, rgba(255,255,255,.08) 0%, rgba(0,0,0,0) 60%)
      `
  const backgroundBlendMode = skinUrl ? 'normal' : 'normal, soft-light'
  const backgroundSize      = skinUrl ? 'cover' : 'cover, cover'
  const backgroundPosition  = 'center'
  const backgroundRepeat    = 'no-repeat'

  return (
    <MotionBox
      onClick={onTap}
      whileTap={{ scale: 0.985 }}
      position="relative"
      w="92%"
      maxW="520px"
      mx="auto"
      mt="2"
      sx={{
        aspectRatio: '1 / 1',
        backgroundImage,
        backgroundBlendMode,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
      }}
      borderRadius="28px"
      overflow="hidden"
      borderWidth="1px"
      borderColor="rgba(255,255,255,.10)"
      boxShadow="inset 0 0 0 1px rgba(255,255,255,.04), 0 14px 40px rgba(0,0,0,.35)"
    >
      {/* легкий глянець */}
      <Box
        pointerEvents="none"
        position="absolute"
        inset="0"
        bg="linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 28%)"
      />

      {/* username — зроблено більшим та читабельним */}
      <Text
        position="absolute"
        top="36px"
        left="0"
        right="0"
        textAlign="center"
        fontWeight="900"
        color="white"
        textShadow="0 6px 18px rgba(0,0,0,.45)"
        sx={{ fontSize: '32px !important', letterSpacing: '0.04em' }}
      >
        {username}
      </Text>

      {/* рівень: окремий SVG лише для 1; інакше — число */}
      <Box position="absolute" inset="0" display="grid" placeItems="center">
        {level === 1 ? (
          <svg
            viewBox="0 0 400 600"
            style={{ width: '68%', filter: 'drop-shadow(0 14px 30px rgba(0,0,0,.45))' }}
          >
            <path d="M250 520H160V280L95 350V250L205 150H250V520Z" fill="#FFFFFF" />
          </svg>
        ) : (
          <Heading
            as="div"
            fontWeight="900"
            lineHeight="1"
            fontSize={['200px', '240px', '280px']}
            color="white"
          >
            {level}
          </Heading>
        )}
      </Box>

      {/* внутрішня тінь */}
      <Box
        pointerEvents="none"
        position="absolute"
        inset="0"
        boxShadow="inset 0 0 40px rgba(0,0,0,.45), inset 0 0 120px rgba(0,0,0,.35)"
      />
    </MotionBox>
  )
}
