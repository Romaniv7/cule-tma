// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTMAUsername } from './hooks/useTMA'
import { Mine } from './screens/Mine'
import { Earn } from './screens/Earn'
import { Predict } from './screens/Predict'
import { Leaderboard } from './screens/Leaderboard'
import { Profile } from './screens/Profile'
import AppShell from './components/AppShell'   // ← default import
import { BottomNav } from './components/BottomNav'

function Header() {
  return (
    <div style={{ padding: '12px 16px' }}>
      {/* За бажанням: назва/баланс/іконки */}
    </div>
  )
}

export function App() {
  useTMAUsername()

  return (
    <BrowserRouter>
      <AppShell
        designHeight={720}     // можна тонко підлаштувати (640–760)
        header={<Header />}    // опціонально — можна прибрати
        footer={<BottomNav />} // нижня навігація завжди фіксована
      >
        <Routes>
          <Route path="/" element={<Navigate to="/mine" replace />} />
          <Route path="/mine" element={<Mine />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
