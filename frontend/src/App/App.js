
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from '../Login/Login';
import Home from '../Home/Home';
import MultiGame from '../Multi-Game/MultiGame';
import { UserProvider } from '../Context/UserContext';
import ProtectedRoute from '../Guard/ProtectedRoute';

function App() {
  return (
      <Router>
          <UserProvider>
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/home" element={<ProtectedRoute element={Home} />} />
                  <Route path="/multi/:username" element={<ProtectedRoute element={MultiGame} />} />
                  <Route path="/solo/:username" element={<ProtectedRoute element={MultiGame} />} />
                  </Routes>
          </UserProvider>
      </Router>
  );
}

export default App;