import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTMAUsername } from './hooks/useTMA'
import { Mine } from './screens/Mine'
import { Earn } from './screens/Earn'
import { Predict } from './screens/Predict'
import { Leaderboard } from './screens/Leaderboard'
import { Profile } from './screens/Profile'
import { BottomNav } from './components/BottomNav'

export function App(){
  useTMAUsername()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mine" />} />
        <Route path="/mine" element={<Mine/>} />
        <Route path="/earn" element={<Earn/>} />
        <Route path="/predict" element={<Predict/>} />
        <Route path="/leaderboard" element={<Leaderboard/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
      <BottomNav/>
    </BrowserRouter>
  )
}