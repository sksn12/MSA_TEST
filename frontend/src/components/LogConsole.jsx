import React, { useEffect, useRef } from 'react';

function LogConsole({ logs }) {
  const consoleLogsRef = useRef(null);

  // Scroll to bottom of logs console
  useEffect(() => {
    if (consoleLogsRef.current) {
      consoleLogsRef.current.scrollTop = consoleLogsRef.current.scrollHeight;
    }
  }, [logs]);

  return (
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
  );
}

export default LogConsole;
