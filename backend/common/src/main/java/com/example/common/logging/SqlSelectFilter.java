package com.example.common.logging;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;

public class SqlSelectFilter extends Filter<ILoggingEvent> {
    @Override
    public FilterReply decide(ILoggingEvent event) {
        if ("org.hibernate.SQL".equals(event.getLoggerName())) {
            String message = event.getMessage();
            if (message != null) {
                String trimmed = message.trim().toLowerCase();
                // select로 시작하는 쿼리 제외
                if (trimmed.startsWith("select")) {
                    return FilterReply.DENY;
                }
            }
        }
        return FilterReply.NEUTRAL;
    }
}
