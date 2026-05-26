import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HealthCheck from '../components/HealthCheck';
import FlowMap from '../components/FlowMap';
import OrderSimulator from '../components/OrderSimulator';
import DataLists from '../components/DataLists';
import LogConsole from '../components/LogConsole';
import { apiFetch } from '../api';

function Dashboard({ user, token, setToken, setUser, handleLogout }) {
  const [services, setServices] = useState({
    auth: 'offline',
    user: 'offline',
    order: 'offline',
    delivery: 'offline'
  });
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [logs, setLogs] = useState([
    {
      time: new Date().toLocaleTimeString(),
      tag: 'SYSTEM',
      message: '모니터링 대시보드가 준비되었습니다. 서비스 검사를 시작합니다...',
      type: 'info'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Animation active states
  const [activeNodes, setActiveNodes] = useState({
    gw: false,
    order: false,
    user: false,
    kafka: false,
    delivery: false
  });
  const [activeLines, setActiveLines] = useState({
    gwOrder: false,
    orderUser: false,
    orderKafka: false,
    kafkaDelivery: false
  });

  // Add Log Helper
  const addLog = (tag, message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, tag, message, type }]);
  };

  // Callback helper for apiFetch when a token gets silently refreshed
  const onTokenRefreshed = (newAccessToken, newUser) => {
    setToken(newAccessToken);
    setUser(newUser);
    addLog('AUTH', '🔄 Access Token 만료 감지! Refresh Token으로 자동 갱신되었습니다.', 'info');
  };

  // Fetch API Health & Data
  const checkHealth = async (url) => {
    try {
      const res = await apiFetch(url, {}, onTokenRefreshed, handleLogout);
      if (res.status === 503 || res.status === 504 || res.status === 500) {
        return 'offline';
      }
      return 'online';
    } catch (e) {}
    return 'offline';
  };

  const fetchData = async () => {
    const statusAuth = await checkHealth('/auth/login');
    const statusUser = await checkHealth('/users');
    const statusOrder = await checkHealth('/orders');
    const statusDelivery = await checkHealth('/deliveries');

    setServices({
      auth: statusAuth,
      user: statusUser,
      order: statusOrder,
      delivery: statusDelivery
    });

    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setOrders([]);
      setDeliveries([]);
      return;
    }

    // Render Orders list
    if (statusOrder === 'online') {
      try {
        const res = await apiFetch('/orders', {}, onTokenRefreshed, handleLogout);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        addLog('ERROR', '주문 목록 파싱 에러: ' + e.message, 'error');
      }
    } else {
      setOrders([]);
    }

    // Render Deliveries list
    if (statusDelivery === 'online') {
      try {
        const res = await apiFetch('/deliveries', {}, onTokenRefreshed, handleLogout);
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data.deliveries || []);
        }
      } catch (e) {
        addLog('ERROR', '배송 목록 파싱 에러: ' + e.message, 'error');
      }
    } else {
      setDeliveries([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Flow animation trigger logic
  const triggerFlowAnimation = (selectedUserId, item) => {
    setActiveNodes(prev => ({ ...prev, gw: true }));
    setActiveLines(prev => ({ ...prev, gwOrder: true }));

    setTimeout(() => {
      setActiveNodes(prev => ({ ...prev, gw: false, order: true }));
      setActiveLines(prev => ({ ...prev, gwOrder: false, orderUser: true }));

      // Order -> User (Feign call)
      addLog('FEIGN', `Order Service가 User Service(ID: ${selectedUserId}) 정보를 OpenFeign으로 동기 호출합니다.`, 'info');
      setActiveNodes(prev => ({ ...prev, user: true }));

      setTimeout(() => {
        setActiveLines(prev => ({ ...prev, orderUser: false, orderKafka: true }));
        setActiveNodes(prev => ({ ...prev, user: false, kafka: true }));

        // Order -> Kafka Event (Async)
        addLog('KAFKA', `주문 성공! 'order-topic'에 주문 이벤트 메세지를 비동기로 발행합니다.`, 'kafka');

        setTimeout(() => {
          setActiveLines(prev => ({ ...prev, orderKafka: false }));
          setActiveNodes(prev => ({ ...prev, kafka: false, order: false }));
        }, 1000);

      }, 800);

    }, 500);
  };

  const triggerKafkaDeliveryAnimation = () => {
    addLog('KAFKA', `🚚 Delivery Service가 Kafka 'order-topic'으로부터 이벤트를 수신(Poll)했습니다!`, 'kafka');
    setActiveNodes(prev => ({ ...prev, kafka: true }));
    setActiveLines(prev => ({ ...prev, kafkaDelivery: true }));

    setTimeout(() => {
      setActiveNodes(prev => ({ ...prev, kafka: false, delivery: true }));
      setActiveLines(prev => ({ ...prev, kafkaDelivery: false }));

      setTimeout(() => {
        setActiveNodes(prev => ({ ...prev, delivery: false }));
      }, 1000);
    }, 800);
  };

  // Submit Simulator Form
  const handleOrderSubmit = async (selectedUserId, item) => {
    setLoading(true);

    try {
      // Start flow animation
      triggerFlowAnimation(selectedUserId, item);
      
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        addLog('HTTP', `POST /orders (JWT 토큰 전송 - ID: ${selectedUserId}, item: "${item}") 전송 시작...`, 'post');
      } else {
        addLog('HTTP', `POST /orders (토큰 미전송 - ID: ${selectedUserId}, item: "${item}") 전송 시작...`, 'post');
      }

      const response = await apiFetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, item })
      }, onTokenRefreshed, handleLogout);

      if (response.ok) {
        const result = await response.json();
        addLog('HTTP', `🟢 주문 접수 완료! 응답: ${JSON.stringify(result.order)}`, 'post');

        // Delay 1.2s to match Kafka poll visual animation
        setTimeout(() => {
          triggerKafkaDeliveryAnimation();
          fetchData();
        }, 1200);

      } else {
        addLog('ERROR', `🔒 주문 생성 실패 (HTTP ${response.status} - ${response.status === 401 ? 'Gateway에서 인증 거부됨' : '에러 발생'})`, 'error');
      }
    } catch (error) {
      addLog('ERROR', `네트워크 에러: ${error.message}`, 'error');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <>
      <header>
        <div className="header-title">
          <div className="logo-glow"></div>
          <h1>MSA SYSTEM FLOW MONITOR</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && (
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              👤 <b>{user.name}</b>님 반갑습니다.
            </span>
          )}
          <button className="refresh-btn" onClick={fetchData}>
            <span>🔄</span> 데이터 새로고침
          </button>
        </div>
      </header>

      <div className="main-container">
        {/* Left Panel: Health check & Simulator */}
        <div className="panel">
          <div>
            <div className="panel-header">
              <div className="panel-title">🟢 서비스 헬스 체크</div>
            </div>
            <HealthCheck services={services} />
          </div>

          <div>
            <div className="panel-header">
              <div className="panel-title">🔑 JWT 통합 인증 로그인</div>
            </div>
            {user ? (
              <div style={{ padding: '12px', background: 'rgba(0, 242, 254, 0.05)', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.2)', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>👤 {user.name} 님 로그인 중</span>
                  <span className="card-badge" style={{ background: 'rgba(0, 242, 254, 0.2)', color: '#fff', fontSize: '0.7rem' }}>{user.role}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', wordBreak: 'break-all' }}>이메일: {user.email}</div>
                <button onClick={handleLogoutClick} className="submit-btn" style={{ background: 'linear-gradient(135deg, #f35555 0%, #d32f2f 100%)', marginTop: '0', cursor: 'pointer' }}>
                  🔓 로그아웃
                </button>
              </div>
            ) : (
              <div style={{ padding: '15px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '15px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '12px' }}>로그인 후 JWT 권한 검증 기능이 있는 시뮬레이터를 사용해보세요.</p>
                <button onClick={() => navigate('/login')} className="submit-btn" style={{ cursor: 'pointer' }}>
                  🔑 로그인 페이지로 이동
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="panel-header">
              <div className="panel-title">🎮 주문 시뮬레이터</div>
            </div>
            <OrderSimulator user={user} loading={loading} onSubmit={handleOrderSubmit} />
          </div>
        </div>

        {/* Center Panel: Flow Map */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">⚡ 실시간 마이크로서비스 데이터 흐름</div>
          </div>
          <FlowMap activeNodes={activeNodes} activeLines={activeLines} />
        </div>

        {/* Right Panel: Data Lists */}
        <div className="panel">
          <DataLists orders={orders} deliveries={deliveries} services={services} />
        </div>

        {/* Bottom Console Panel */}
        <LogConsole logs={logs} />
      </div>
    </>
  );
}

export default Dashboard;
