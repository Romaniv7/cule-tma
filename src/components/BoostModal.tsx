import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Button, VStack, HStack, Text, Box
} from '@chakra-ui/react'
import { save } from '../lib/game'
import type { GameState } from '../lib/game'

const ENERGY_TIERS = [150, 300, 500, 750, 1000]
const ENERGY_COSTS = [1000, 2500, 5000, 8000, 12000]
const MULTI_TIERS  = [2, 3, 4, 5, 6]
const MULTI_COSTS  = [2000, 5000, 9000, 14000, 20000]

const yellowBtn = {
  bg: '#ffdf1b',
  color: '#0b0b0b',
  _hover: { bg: '#ffd800' },
  _active:{ bg: '#e6c900' },
  _disabled:{ opacity: 0.5, cursor: 'not-allowed' }
} as const

export function BoostModal({
  isOpen, onClose, state, setState,
}: {
  isOpen: boolean
  onClose: () => void
  state: GameState
  setState: (s: GameState) => void
}) {
  const ei = Math.max(ENERGY_TIERS.indexOf(state.energyMax), 0)
  const mi = Math.max(MULTI_TIERS.indexOf(state.multi), 0)

  const canEnergy = ei < ENERGY_TIERS.length - 1
  const canMulti  = mi < MULTI_TIERS.length - 1

  const buyEnergy = () => {
    if (!canEnergy) return
    const price = ENERGY_COSTS[ei + 1]
    if (state.coins < price) return alert('Не вистачає монет')
    const s: GameState = {
      ...state,
      coins: state.coins - price,
      energyMax: ENERGY_TIERS[ei + 1],
      energy: ENERGY_TIERS[ei + 1],
    }
    save(s); setState(s); onClose()
  }

  const buyMulti = () => {
    if (!canMulti) return
    const price = MULTI_COSTS[mi + 1]
    if (state.coins < price) return alert('Не вистачає монет')
    const s: GameState = { ...state, coins: state.coins - price, multi: MULTI_TIERS[mi + 1] }
    save(s); setState(s); onClose()
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
        // відступи від країв на мобільному
        mx="4"
        maxW="420px"
        w="calc(100% - 32px)"
      >
        <ModalHeader fontWeight="900">Boost</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {/* ENERGY */}
            <HStack
              justify="space-between"
              p="3"
              bg="#111626"
              borderRadius="16px"
              borderWidth="1px"
              borderColor="rgba(255,255,255,.08)"
            >
              <Box>
                <Text>Енергія: {state.energyMax} → {canEnergy ? ENERGY_TIERS[ei + 1] : 'макс'}</Text>
                <Text fontWeight="bold" opacity={0.9}>
                  Ціна: {canEnergy ? ENERGY_COSTS[ei + 1] : '—'} монет
                </Text>
              </Box>
              <Button onClick={buyEnergy} isDisabled={!canEnergy} {...yellowBtn}>
                Купити
              </Button>
            </HStack>

            {/* MULTI */}
            <HStack
              justify="space-between"
              p="3"
              bg="#111626"
              borderRadius="16px"
              borderWidth="1px"
              borderColor="rgba(255,255,255,.08)"
            >
              <Box>
                <Text>Мультитап: ×{state.multi} → {canMulti ? `×${MULTI_TIERS[mi + 1]}` : 'макс'}</Text>
                <Text fontWeight="bold" opacity={0.9}>
                  Ціна: {canMulti ? MULTI_COSTS[mi + 1] : '—'} монет
                </Text>
              </Box>
              <Button onClick={buyMulti} isDisabled={!canMulti} {...yellowBtn}>
                Купити
              </Button>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter pt="2">
          <Button variant="outline" onClick={onClose}>Закрити</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}