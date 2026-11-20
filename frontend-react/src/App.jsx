import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  // Check if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect to dashboard if logged in, otherwise show login */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        
        {/* Protect dashboard route */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;