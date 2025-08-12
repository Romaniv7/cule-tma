declare global {
  interface TelegramWebApp {
    initData?: string;
    initDataUnsafe?: any;
    expand?: () => void;
    ready?: () => void;
    setHeaderColor?: (color: string) => void;
  }
  interface Window { Telegram?: { WebApp?: TelegramWebApp } }
}
export {};
