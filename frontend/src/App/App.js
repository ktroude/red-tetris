
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from '../Login/Login';
import Home from '../Home/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;