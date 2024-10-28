
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from '../Context/UserContext';
import Login from '../pages/Login/Login';
import Home from '../pages/Home/Home';
import ProtectedRoute from '../Guard/ProtectedRoute';
import SoloGame from '../pages/Solo-Game/SoloGame';
import MultiGame from '../pages/Multi-Game/MultiGame';
import BackgroundMusic from '../components/BackgroundMusic/BackgroundMusic';
import History from '../pages/History/History';

function App() {
  return (
      <Router>
          <UserProvider>
            <BackgroundMusic />
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/home" element={<ProtectedRoute element={Home} />} />
                  <Route path="/solo/:username" element={<ProtectedRoute element={SoloGame} />} />
                  <Route path="/multi/:roomName/:username" element={<ProtectedRoute element={MultiGame} />} />
                  <Route path="/history/:username" element={<ProtectedRoute element={History} />}/>
                </Routes>
          </UserProvider>
      </Router>
  );
}

export default App;