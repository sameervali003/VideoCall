// components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthHook } from '../hooks/useAuth'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthHook(); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(email, password);
      // Save user info to localStorage
      console.log(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      navigate('/chats'); // Redirect to /chats on successful login
    } catch (error) {
      console.error('Failed to login:', error.message);
      alert(error.message); // Optionally show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
