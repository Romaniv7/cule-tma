// src/hooks/useTgViewport.ts
import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export function useTgViewport() {
  useEffect(() => {
    const set = () => {
      const h =
        WebApp.viewportStableHeight ||
        WebApp.viewportHeight ||
        window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`)
    }

    set()
    const onVp = () => set()
    const onResize = () => set()

    WebApp.onEvent('viewportChanged', onVp)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      WebApp.offEvent('viewportChanged', onVp)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])
}
