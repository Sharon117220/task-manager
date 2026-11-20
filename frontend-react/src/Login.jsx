  import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log("Login successful, navigating...");
          
          // Force redirect to dashboard
          window.location.href = '/dashboard'; 
        } else {
          alert(data.error || "Login failed");
        }
      } else {
        const data = await api.register(email, password);
        if (data.success) {
          alert('Registered! Please login.');
          setIsLogin(true);
        } else {
          alert(data.error || "Registration failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert('Server error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? '🔐 Welcome Back' : '📝 Create Account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p 
          className="text-center mt-4 text-sm text-gray-600 cursor-pointer hover:text-indigo-600"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
}