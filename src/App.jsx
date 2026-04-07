import { Routes, Route } from 'react-router-dom'
import './App.css'
import TopPage from './pages/TopPage'
import ExhibitorDetail from './pages/ExhibitorDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/exhibitor/:id" element={<ExhibitorDetail />} />
    </Routes>
  )
}

export default App
