import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from './api';

const WS_ENDPOINT =
  (typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    ? `${window.location.protocol}//${window.location.hostname}:8080`
    : API_BASE_URL) + '/ws-smart-lock';

const parsePayload = (body) => {
  if (!body) return null;

  try {
    return JSON.parse(body);
  } catch (error) {
    console.warn('Invalid telemetry payload:', error);
    return null;
  }
};

export const createTelemetrySubscription = ({ deviceCode, onMessage, onStatusChange }) => {
  if (!deviceCode) {
    return () => {};
  }

  let disposed = false;
  let subscription = null;

  const setStatus = (status) => {
    if (!disposed) {
      onStatusChange?.(status);
    }
  };

  const client = new Client({
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    webSocketFactory: () => new SockJS(WS_ENDPOINT),
    debug: () => {},
    onConnect: () => {
      setStatus('live');
      subscription = client.subscribe(`/topic/devices/${deviceCode}/telemetry`, (frame) => {
        const payload = parsePayload(frame.body);
        if (payload) {
          onMessage?.(payload);
        }
      });
    },
    onStompError: () => {
      setStatus('reconnecting');
    },
    onWebSocketError: () => {
      setStatus('reconnecting');
    },
    onWebSocketClose: () => {
      setStatus('reconnecting');
    },
  });

  setStatus('connecting');
  client.activate();

  return () => {
    disposed = true;
    subscription?.unsubscribe();
    client.deactivate();
  };
};
