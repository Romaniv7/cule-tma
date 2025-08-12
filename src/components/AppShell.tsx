import { useEffect, useRef, useState } from 'react'
import WebApp from '@twa-dev/sdk'

type Props = {
  designHeight?: number // висота “дизайн-полотна” у px
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode // твій контент усередині canvas
}

// Рахуємо доступну висоту і масштабуємо “canvas”,
// щоб він повністю вмістився між шапкою і футером без скролу.
export default function AppShell({
  designHeight = 720,
  header,
  footer,
  children,
}: Props) {
  const headerRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const recalc = () => {
    const appH =
      WebApp.viewportStableHeight ||
      WebApp.viewportHeight ||
      window.innerHeight
    const hH = headerRef.current?.getBoundingClientRect().height || 0
    const fH = footerRef.current?.getBoundingClientRect().height || 0
    const safeTop = Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)')
        .replace('px', '') || 0
    )
    const safeBottom = Number(
      getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-bottom)')
        .replace('px', '') || 0
    )
    const paddingY = 16 * 2 // вертикальні відступи всередині wrapper (нижче)
    const available = appH - hH - fH - safeTop - safeBottom - paddingY
    const s = Math.min(available / designHeight, 1)
    setScale(s > 0 ? s : 0.85) // запобіжник на дуже малих екранах
  }

  useEffect(() => {
    recalc()
    const onVp = () => recalc()
    const onRs = () => recalc()
    WebApp.onEvent('viewportChanged', onVp)
    window.addEventListener('resize', onRs)
    window.addEventListener('orientationchange', onRs)
    return () => {
      WebApp.offEvent('viewportChanged', onVp)
      window.removeEventListener('resize', onRs)
      window.removeEventListener('orientationchange', onRs)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-shell">
      <div ref={headerRef} className="shell-header">{header}</div>

      <div className="canvas-wrapper">
        <div
          className="canvas"
          style={{
            // фіксована дизайн-висота + масштаб до доступної висоти
            height: `${designHeight}px`,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>

      <div ref={footerRef} className="shell-footer">{footer}</div>
    </div>
  )
}
