import React, { useState, useEffect, useRef } from 'react';

function App() {
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
  const [userId, setUserId] = useState('1');
  const [item, setItem] = useState('지포스 RTX 5090');
  const [loading, setLoading] = useState(false);

  // JWT & Authentication States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [loginLoading, setLoginLoading] = useState(false);

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

  // DOM Refs for SVG connection line calculations
  const containerRef = useRef(null);
  const nodeGwRef = useRef(null);
  const nodeOrderRef = useRef(null);
  const nodeUserRef = useRef(null);
  const nodeKafkaRef = useRef(null);
  const nodeDeliveryRef = useRef(null);

  const lineGwOrderRef = useRef(null);
  const pulseGwOrderRef = useRef(null);
  const lineOrderUserRef = useRef(null);
  const pulseOrderUserRef = useRef(null);
  const lineOrderKafkaRef = useRef(null);
  const pulseOrderKafkaRef = useRef(null);
  const lineKafkaDeliveryRealRef = useRef(null);
  const pulseKafkaDeliveryRef = useRef(null);

  const consoleLogsRef = useRef(null);

  // Add Log Helper
  const addLog = (tag, message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, tag, message, type }]);
  };

  // Scroll to bottom of logs console
  useEffect(() => {
    if (consoleLogsRef.current) {
      consoleLogsRef.current.scrollTop = consoleLogsRef.current.scrollHeight;
    }
  }, [logs]);

  // Update SVG Connector lines dynamically based on element locations
  const updateConnectorLines = () => {
    try {
      if (
        !nodeGwRef.current ||
        !nodeOrderRef.current ||
        !nodeUserRef.current ||
        !nodeKafkaRef.current ||
        !nodeDeliveryRef.current ||
        !containerRef.current
      ) {
        return;
      }

      const gw = nodeGwRef.current.getBoundingClientRect();
      const order = nodeOrderRef.current.getBoundingClientRect();
      const user = nodeUserRef.current.getBoundingClientRect();
      const kafka = nodeKafkaRef.current.getBoundingClientRect();
      const delivery = nodeDeliveryRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();

      const getCenter = (rect) => ({
        x: rect.left - container.left + rect.width / 2,
        y: rect.top - container.top + rect.height / 2
      });

      const ptGw = getCenter(gw);
      const ptOrder = getCenter(order);
      const ptUser = getCenter(user);
      const ptKafka = getCenter(kafka);
      const ptDelivery = getCenter(delivery);

      // 1. Gateway -> Order
      const pathGwOrder = `M ${ptGw.x}, ${ptGw.y + gw.height / 2} L ${ptOrder.x}, ${ptOrder.y - order.height / 2}`;
      lineGwOrderRef.current?.setAttribute('d', pathGwOrder);
      pulseGwOrderRef.current?.setAttribute('d', pathGwOrder);

      // 2. Order -> User
      const pathOrderUser = `M ${ptOrder.x - order.width / 2}, ${ptOrder.y} L ${ptUser.x + user.width / 2}, ${ptUser.y}`;
      lineOrderUserRef.current?.setAttribute('d', pathOrderUser);
      pulseOrderUserRef.current?.setAttribute('d', pathOrderUser);

      // 3. Order -> Kafka
      const pathOrderKafka = `M ${ptOrder.x}, ${ptOrder.y + order.height / 2} L ${ptKafka.x}, ${ptKafka.y - kafka.height / 2}`;
      lineOrderKafkaRef.current?.setAttribute('d', pathOrderKafka);
      pulseOrderKafkaRef.current?.setAttribute('d', pathOrderKafka);

      // 4. Kafka -> Delivery
      const pathKafkaDelivery = `M ${ptKafka.x + kafka.width / 2}, ${ptKafka.y} Q ${(ptKafka.x + ptDelivery.x) / 2}, ${(ptKafka.y + ptDelivery.y) / 2 - 30} ${ptDelivery.x - delivery.width / 2}, ${ptDelivery.y}`;
      lineKafkaDeliveryRealRef.current?.setAttribute('d', pathKafkaDelivery);
      pulseKafkaDeliveryRef.current?.setAttribute('d', pathKafkaDelivery);
    } catch (e) {
      console.error("Failed to draw SVG connectors", e);
    }
  };

  // Resize and status load hook
  useEffect(() => {
    window.addEventListener('resize', updateConnectorLines);
    // Delay to let React layout rendering finish
    const timer = setTimeout(updateConnectorLines, 500);
    return () => {
      window.removeEventListener('resize', updateConnectorLines);
      clearTimeout(timer);
    };
  }, [orders, deliveries, services]);

  // Fetch API Health & Data
  const checkHealth = async (url) => {
    try {
      await fetch(url);
      // Any response from server (even 401 Unauthorized) means the service is online!
      return 'online';
    } catch (e) { }
    return 'offline';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoginLoading(true);
    addLog('HTTP', `로그인 시도 (POST /auth/login) - email: ${email}`, 'post');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        addLog('AUTH', `🔑 로그인 성공! JWT 발급 완료. 환영합니다, ${data.user.name}님!`, 'info');
      } else {
        const errData = await res.json().catch(() => ({}));
        addLog('ERROR', `로그인 실패: ${errData.message || '이메일 또는 비밀번호가 틀렸습니다.'}`, 'error');
      }
    } catch (e) {
      addLog('ERROR', `로그인 네트워크 에러: ${e.message}`, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    addLog('AUTH', `🔓 로그아웃 되었습니다.`, 'info');
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

    const headers = { 'Authorization': `Bearer ${currentToken}` };

    // Render Orders list
    if (statusOrder === 'online') {
      try {
        const res = await fetch('/orders', { headers });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else if (res.status === 401) {
          handleLogout();
          addLog('ERROR', '인증 세션이 만료되어 로그아웃되었습니다.', 'error');
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
        const res = await fetch('/deliveries', { headers });
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
  const triggerFlowAnimation = (selectedUserId) => {
    updateConnectorLines();
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item.trim()) return;

    setLoading(true);
    const selectedUserId = user ? user.id : parseInt(userId);

    try {
      // Start flow animation
      triggerFlowAnimation(selectedUserId);
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        addLog('HTTP', `POST /orders (JWT 토큰 전송 - ID: ${selectedUserId}, item: "${item}") 전송 시작...`, 'post');
      } else {
        addLog('HTTP', `POST /orders (토큰 미전송 - ID: ${selectedUserId}, item: "${item}") 전송 시작...`, 'post');
      }

      const response = await fetch('/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: selectedUserId, item })
      });

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

  return (
    <>
      <header>
        <div className="header-title">
          <div className="logo-glow"></div>
          <h1>MSA SYSTEM FLOW MONITOR</h1>
        </div>
        <button className="refresh-btn" onClick={fetchData}>
          <span>🔄</span> 데이터 새로고침
        </button>
      </header>

      <div className="main-container">
        {/* Left Panel: Health check & Simulator */}
        <div className="panel">
          <div>
            <div className="panel-header">
              <div className="panel-title">🟢 서비스 헬스 체크</div>
            </div>
            <div className="status-list">
              <div className="status-item">
                <div className="service-info">
                  <span className="service-name">Gateway</span>
                  <span className="service-port">8080</span>
                </div>
                <div className="status-badge online"><span className="status-dot"></span>Online</div>
              </div>
              <div className="status-item">
                <div className="service-info">
                  <span className="service-name">Auth Service</span>
                  <span className="service-port">3004</span>
                </div>
                <div className={`status-badge ${services.auth === 'online' ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>{services.auth === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="status-item">
                <div className="service-info">
                  <span className="service-name">User Service</span>
                  <span className="service-port">3001</span>
                </div>
                <div className={`status-badge ${services.user === 'online' ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>{services.user === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="status-item">
                <div className="service-info">
                  <span className="service-name">Order Service</span>
                  <span className="service-port">3002</span>
                </div>
                <div className={`status-badge ${services.order === 'online' ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>{services.order === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="status-item">
                <div className="service-info">
                  <span className="service-name">Delivery Service</span>
                  <span className="service-port">3003</span>
                </div>
                <div className={`status-badge ${services.delivery === 'online' ? 'online' : 'offline'}`}>
                  <span className="status-dot"></span>{services.delivery === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
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
                <button onClick={handleLogout} className="submit-btn" style={{ background: 'linear-gradient(135deg, #f35555 0%, #d32f2f 100%)', marginTop: '0', cursor: 'pointer' }}>
                  🔓 로그아웃
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => { setEmail('alice@example.com'); setPassword('password123'); }} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Alice 입력</button>
                  <button type="button" onClick={() => { setEmail('bob@example.com'); setPassword('password123'); }} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Bob 입력</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>이메일</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>비밀번호</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }} required />
                </div>
                <button type="submit" disabled={loginLoading} className="submit-btn" style={{ marginTop: '5px', padding: '8px', cursor: 'pointer' }}>
                  {loginLoading ? '로그인 중...' : '🔑 로그인 (POST /auth/login)'}
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="panel-header">
              <div className="panel-title">🎮 주문 시뮬레이터</div>
            </div>
            <form className="simulator-form" onSubmit={handleSubmit}>
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
          </div>
        </div>

        {/* Center Panel: Flow Map */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">⚡ 실시간 마이크로서비스 데이터 흐름</div>
          </div>

          <div className="flow-container" ref={containerRef}>
            <svg className="network-svg">
              {/* Connections */}
              <path className={`flow-line ${activeLines.gwOrder ? 'active' : ''}`} ref={lineGwOrderRef} />
              <path className={`flow-pulse ${activeLines.gwOrder ? 'active' : ''}`} ref={pulseGwOrderRef} />

              <path className={`flow-line ${activeLines.orderUser ? 'active' : ''}`} ref={lineOrderUserRef} />
              <path className={`flow-pulse ${activeLines.orderUser ? 'active' : ''}`} ref={pulseOrderUserRef} />

              <path className={`flow-line ${activeLines.orderKafka ? 'active-kafka' : ''}`} ref={lineOrderKafkaRef} />
              <path className={`flow-pulse ${activeLines.orderKafka ? 'active-kafka' : ''}`} ref={pulseOrderKafkaRef} />

              <path className={`flow-line ${activeLines.kafkaDelivery ? 'active-kafka' : ''}`} ref={lineKafkaDeliveryRealRef} />
              <path className={`flow-pulse ${activeLines.kafkaDelivery ? 'active-kafka' : ''}`} ref={pulseKafkaDeliveryRef} />
            </svg>

            <div className={`flow-node gateway-node ${activeNodes.gw ? 'active-node' : ''}`} ref={nodeGwRef}>
              API Gateway
              <span className="node-type">Port 8080</span>
            </div>

            <div className={`flow-node user-node ${activeNodes.user ? 'active-node' : ''}`} ref={nodeUserRef}>
              User Service
              <span className="node-type">Port 3001</span>
            </div>

            <div className={`flow-node order-node ${activeNodes.order ? 'active-node' : ''}`} ref={nodeOrderRef}>
              Order Service
              <span className="node-type">Port 3002</span>
            </div>

            <div className={`flow-node kafka-node ${activeNodes.kafka ? 'active-node' : ''}`} ref={nodeKafkaRef}>
              Apache Kafka
              <span className="node-type">order-topic</span>
            </div>

            <div className={`flow-node delivery-node ${activeNodes.delivery ? 'active-node' : ''}`} ref={nodeDeliveryRef}>
              Delivery Service
              <span className="node-type">Port 3003</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Data Lists */}
        <div className="panel">
          <div>
            <div className="panel-header">
              <div className="panel-title">📋 최근 주문 목록 (GET /orders)</div>
            </div>
            <div className="list-container">
              {orders.length === 0 ? (
                <div className="empty-state">
                  {services.order === 'online' ? '최근 주문이 없습니다.' : 'Order Service 비활성화됨'}
                </div>
              ) : (
                [...orders].reverse().map((order, idx) => (
                  <div className="card-item order-card" key={idx}>
                    <div className="card-row">
                      <span className="card-title">주문 ID: {order.orderId}</span>
                      <span className="card-badge" style={{ background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)' }}>
                        결합완료 (Feign)
                      </span>
                    </div>
                    <div className="card-sub">📦 상품: <b>{order.item}</b></div>
                    <div className="card-row" style={{ marginTop: '4px' }}>
                      <span className="card-sub">👤 주문자: <b>{order.userName || '알 수 없음'}</b></span>
                      <span className="card-sub">ID: {order.userId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="panel-header">
              <div className="panel-title">🚚 배송 처리 대기열 (GET /deliveries)</div>
            </div>
            <div className="list-container">
              {deliveries.length === 0 ? (
                <div className="empty-state">
                  {services.delivery === 'online' ? '처리 대기 중인 배송이 없습니다.' : 'Delivery Service 비활성화됨'}
                </div>
              ) : (
                [...deliveries].reverse().map((del, idx) => {
                  const timeStr = new Date(del.timestamp).toLocaleTimeString();
                  return (
                    <div className="card-item delivery-card" key={idx}>
                      <div className="card-row">
                        <span className="card-title">📦 배송번호: DEL-{del.orderId}</span>
                        <span className="card-badge status-preparing">배송 준비중</span>
                      </div>
                      <div className="card-sub">상품명: <b>{del.item}</b> (주문ID: {del.orderId})</div>
                      <div className="card-row" style={{ marginTop: '4px' }}>
                        <span className="time-ago">🕒 수신시간: {timeStr}</span>
                        <span className="card-sub" style={{ fontSize: '0.75rem' }}>Kafka 이벤트를 성공적으로 소비함</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Bottom Console Panel */}
        <div className="panel console-panel">
          <div className="panel-header">
            <div className="panel-title">🛠️ API & Kafka 실시간 로그 콘솔</div>
          </div>
          <div className="console-logs" ref={consoleLogsRef}>
            {logs.map((log, idx) => {
              let tagClass = 'tag-info';
              if (log.type === 'post') tagClass = 'tag-post';
              if (log.type === 'kafka') tagClass = 'tag-kafka';
              if (log.type === 'error') tagClass = 'tag-error';

              return (
                <div className="console-line" key={idx}>
                  <span className="console-timestamp">[{log.time}]</span>
                  <span className={`console-tag ${tagClass}`}>{log.tag}</span>
                  <span className="console-text">{log.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
