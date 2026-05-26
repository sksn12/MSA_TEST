import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Calls auth-service /register endpoint which routes to user-service /signup
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('회원가입 성공! 잠시 후 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setErrorMsg(`네트워크 에러: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'radial-gradient(circle at center, #1b2735 0%, #090a0f 100%)' }}>
      <div className="panel" style={{ width: '400px', padding: '30px', borderRadius: '12px', border: '1px solid rgba(0, 242, 254, 0.15)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div className="logo-glow" style={{ margin: '0 auto 10px auto' }}></div>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0, background: 'linear-gradient(to right, #00f2fe, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MSA USER SIGNUP</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '5px' }}>신규 회원을 등록하고 JWT 서비스를 활용해보세요.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: '6px', color: '#ff5252', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: '6px', color: '#4caf50', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'center' }}>
            🟢 {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>이메일 주소</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }} required />
          </div>
          <button type="submit" disabled={loading} className="submit-btn" style={{ marginTop: '10px', padding: '12px', fontSize: '0.95rem', cursor: 'pointer' }}>
            {loading ? '가입 진행 중...' : '👤 회원가입 완료'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold' }}>
            로그인 하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
