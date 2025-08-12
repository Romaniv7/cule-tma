import { Grid, Center, VStack, Text, Box } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'

import MineIcon from '../assets/mine.svg?react'
import EarnIcon from '../assets/earn.svg?react'
import PredictIcon from '../assets/predict.svg?react'
import LeaderboardIcon from '../assets/leaderboard.svg?react'
import ProfileIcon from '../assets/profile.svg?react'

const ACTIVE   = '#1e3a8a'  // blau
const INACTIVE = '#9aa4b2'

const BTN_W = 64
const BTN_H = 64
const ICON  = 22

const NAV = [
  { to: '/mine',        label: 'Mine',    Icon: MineIcon },
  { to: '/earn',        label: 'Earn',    Icon: EarnIcon },
  { to: '/predict',     label: 'Predict', Icon: PredictIcon },
  { to: '/leaderboard', label: 'Leaders', Icon: LeaderboardIcon },
  { to: '/profile',     label: 'Profile', Icon: ProfileIcon },
]

export function BottomNav(){
  const { pathname } = useLocation()

  return (
    <Grid
      position="fixed" bottom="0" left="0" right="0"
      templateColumns="repeat(5, 1fr)"
      h="80px" px="8px"
      bg="#0b0f1a"
      borderTop="1px solid" borderColor="gray.700"
      zIndex={10}
    >
      {NAV.map(({to, label, Icon})=>{
        // якщо у вкладок будуть підавтошляхи — використовуй startsWith
        const isActive = pathname === to
        const color = isActive ? ACTIVE : INACTIVE

        return (
          <NavLink key={to} to={to} style={{ textDecoration:'none' }} aria-current={isActive ? 'page' : undefined}>
            <Center w="100%" h="100%">
              <VStack
                w={`${BTN_W}px`} h={`${BTN_H}px`}
                spacing={1}
                align="center" justify="center"
                color={color}
              >
                {/* ВАЖЛИВО: ці SVG мають бути монохромні з fill="currentColor", тоді вони фарбуються у color */}
                <Box as={Icon} width={`${ICON}px`} height={`${ICON}px`} />
                <Text fontSize="xs">{label}</Text>

                {/* Активний індикатор → тонка рисочка знизу для візуальної стабільності */}
                <Box
                  w="28px" h="3px"
                  borderRadius="999px"
                  bg={isActive ? color : 'transparent'}
                  mt="2px"
                />
              </VStack>
            </Center>
          </NavLink>
        )
      })}
    </Grid>
  )
}