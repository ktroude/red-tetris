
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from '../Context/UserContext';
import Login from '../pages/Login/Login';
import Home from '../pages/Home/Home';
import ProtectedRoute from '../Guard/ProtectedRoute';
import SoloGame from '../components/Solo-Game/SoloGame';

function App() {
  return (
      <Router>
          <UserProvider>
              <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/home" element={<ProtectedRoute element={Home} />} />
                  <Route path="/solo/:username" element={<ProtectedRoute element={SoloGame} />} />
                  </Routes>
          </UserProvider>
      </Router>
  );
}

export default App;