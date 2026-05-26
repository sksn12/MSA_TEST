import React, { useState } from 'react';

function OrderSimulator({ user, loading, onSubmit }) {
  const [userId, setUserId] = useState('1');
  const [item, setItem] = useState('지포스 RTX 5090');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!item.trim()) return;
    const selectedUserId = user ? user.id : parseInt(userId);
    onSubmit(selectedUserId, item);
  };

  return (
    <form className="simulator-form" onSubmit={handleFormSubmit}>
      <div className="form-group">
        <label>주문 요청 고객</label>
        {user ? (
          <div style={{ padding: '10px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '4px', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center' }}>
            👤 {user.name} (ID: {user.id}) - 인증됨 🔑
          </div>
        ) : (
          <>
            <select className="form-select" value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="1">Alice (ID: 1 - 비인증)</option>
              <option value="2">Bob (ID: 2 - 비인증)</option>
              <option value="999">Charlie (ID: 999 - 미등록 고객)</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: '#ff5252', marginTop: '4px', textAlign: 'left' }}>
              ⚠️ 로그인하지 않고 주문 시 Gateway에서 HTTP 401 에러를 반환합니다.
            </div>
          </>
        )}
      </div>
      <div className="form-group">
        <label>상품 선택</label>
        <input
          type="text"
          className="form-input"
          placeholder="예: 게이밍 키보드"
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
      </div>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? (
          <>
            <span className="loading-ring"></span> 주문 처리 중...
          </>
        ) : (
          '🎮 주문 넣기 (POST /orders)'
        )}
      </button>
    </form>
  );
}

export default OrderSimulator;
