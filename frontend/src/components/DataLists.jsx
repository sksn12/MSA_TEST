import React from 'react';

function DataLists({ orders, deliveries, services }) {
  return (
    <>
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
    </>
  );
}

export default DataLists;
