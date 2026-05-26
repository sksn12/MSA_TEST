import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoginLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        // Save tokens and user info
        localStorage.setItem('token', data.token); // Access Token
        localStorage.setItem('refreshToken', data.refreshToken); // Refresh Token
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onLoginSuccess(data.token, data.refreshToken, data.user);
        navigate('/');
      } else {
        setErrorMsg(data.message || '이메일 또는 비밀번호가 틀렸습니다.');
      }
    } catch (err) {
      setErrorMsg(`네트워크 에러: ${err.message}`);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)' }}>
      <div className="panel" style={{ width: '400px', padding: '30px', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.15)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div className="logo-glow" style={{ margin: '0 auto 10px auto' }}></div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0, background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MSA SYSTEM LOGIN</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '5px' }}>JWT 통합 인증 서비스를 통해 토큰을 발급받습니다.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: '6px', color: '#ff5252', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>이메일 주소</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }} required />
          </div>
          <button type="submit" disabled={loginLoading} className="submit-btn" style={{ marginTop: '10px', padding: '12px', fontSize: '0.95rem', cursor: 'pointer' }}>
            {loginLoading ? '인증 처리 중...' : '🔑 로그인 및 JWT 발급'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          아직 계정이 없으신가요?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>
            회원가입 하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
