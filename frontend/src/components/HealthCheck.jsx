import React from 'react';

function HealthCheck({ services }) {
  return (
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
  );
}

export default HealthCheck;
