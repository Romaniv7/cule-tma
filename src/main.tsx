import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { App } from './App'
import WebApp from '@twa-dev/sdk'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import './styles.css'
import { useTgViewport } from './hooks/useTgViewport'

// Ініціалізація Telegram WebApp
WebApp.ready()
WebApp.expand()

// Дефолтний скін при першому запуску
if (typeof window !== 'undefined') {
  const cur = localStorage.getItem('shop_active_skin')
  if (!cur) localStorage.setItem('shop_active_skin', 'default')
}

const theme = extendTheme({
  fonts: {
    heading: 'Ubuntu, system-ui, sans-serif',
    body: 'Ubuntu, system-ui, sans-serif',
  },
  colors: {
    blau: { 500: '#1e3a8a' },
    grana: { 500: '#8b1c3d' },
  },
  styles: {
    global: {
      body: {
        background:
          'radial-gradient(120% 120% at 50% -10%, #10203a 0%, #0e172a 50%, #0b0f1a 100%)',
        color: '#f8fafc',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      },
      html: { height: '100%' },
      '#root': { height: '100%' },
    },
  },
})

function Root() {
  useTgViewport()
  return (
    <div className="app-root">
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
