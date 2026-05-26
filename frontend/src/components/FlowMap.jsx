import React, { useEffect, useRef } from 'react';

function FlowMap({ activeNodes, activeLines }) {
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

  useEffect(() => {
    updateConnectorLines();
  }, [activeNodes, activeLines]);

  useEffect(() => {
    window.addEventListener('resize', updateConnectorLines);
    const timer = setTimeout(updateConnectorLines, 500);
    return () => {
      window.removeEventListener('resize', updateConnectorLines);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flow-container" ref={containerRef}>
      <svg className="network-svg">
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
  );
}

export default FlowMap;
