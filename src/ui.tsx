// ДВА варіанти монетки:
// 1) CoinIcon — відображає ОРИГІНАЛЬНІ кольори (не залежить від currentColor, не «біле обведення»)
// 2) CoinIconMono — монохромний варіант, фарбується у currentColor (тільки якщо це потрібно десь окремо)

import CoinCompMono from './assets/culecoin.svg?react'
import coinUrl from './assets/culecoin.svg'

export const CULE_YELLOW = '#ffdf1b'
export const darkText = '#0b0b0b'

export const yellowBtnProps = {
  bg: CULE_YELLOW, color: darkText,
  _hover: { bg: '#ffd800' },
  _active:{ bg: '#e6c900' },
  _disabled:{ opacity:.5, cursor:'not-allowed' },
} as const

// 1) БЕЗЗМІННИЙ за кольором варіант (рекомендується скрізь у грі)
export function CoinIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { width = 18, height = 18, alt = 'coin', style, ...rest } = props
  return (
    <img
      src={coinUrl}
      width={width}
      height={height}
      alt={alt}
      style={{ display:'inline-block', verticalAlign:'middle', ...style }}
      {...rest}
    />
  )
}

// 2) МОНОХРОМНИЙ (лише якщо спеціально хочеш підфарбовувати через currentColor)
export function CoinIconMono(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props
  return <CoinCompMono width={width} height={height} {...rest} />
}
