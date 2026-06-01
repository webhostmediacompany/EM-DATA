// src/hooks/useReadingsSocket.js
import { useEffect, useRef } from "react";

export default function useReadingsSocket(onMessage) {
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);

    useEffect(() => {
        function connect() {
            const protocol = window.location.protocol === "https:" ? "wss" : "ws";

            // ENV first → fallback to current host
            const host =
                import.meta.env.VITE_WS_HOST ||
                `${window.location.hostname}:8081`;

            const url = `${protocol}://${host}/ws/readings/`;

            console.log("[WS] Connecting →", url);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                console.log("[WS] Connected");
                if (reconnectRef.current) {
                    clearTimeout(reconnectRef.current);
                    reconnectRef.current = null;
                }
            };

            wsRef.current.onmessage = (e) => {
                try {
                    const payload = JSON.parse(e.data);
                    if (onMessage) onMessage(payload);
                } catch (err) {
                    console.error("[WS] JSON parse error:", err);
                }
            };

            wsRef.current.onerror = (err) => {
                console.error("[WS] Error:", err);
            };

            wsRef.current.onclose = () => {
                console.warn("[WS] Disconnected. Retrying in 3 seconds…");
                reconnectRef.current = setTimeout(connect, 3000);
            };
        }

        connect();

        return () => {
            console.log("[WS] Cleaning up…");

            if (reconnectRef.current) {
                clearTimeout(reconnectRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [onMessage]);
}
