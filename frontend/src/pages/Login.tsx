import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشلت عملية تسجيل الدخول');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>مرحباً بك مجدداً</h1>
        <p className="subtitle">تسجيل الدخول إلى محراب و كتاب</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="أدخل بريدك الإلكتروني" 
              required 
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="أدخل كلمة المرور الخاصة بك" 
              required 
            />
          </div>

          <button type="submit" className="login-btn">تسجيل الدخول</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
