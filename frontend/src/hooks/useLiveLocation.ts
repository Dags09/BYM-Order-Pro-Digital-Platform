import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";

interface UseLiveLocationResult {
    sharing: boolean;
    error: string | null;
    lastSentAt: Date | null;
    toggle: () => void;
}

const MIN_UPDATE_INTERVAL_MS = 8000;

// Watches the device's GPS position and pushes updates to the backend
// while `active` (sharing) is on. Throttled so we don't spam the API.
export function useLiveLocation(orderId: string): UseLiveLocationResult {
    const [sharing, setSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const lastSentRef = useRef<number>(0);

    useEffect(() => {
        if (!sharing) return;

        if (!("geolocation" in navigator)) {
            setError("Geolocation isn't supported on this device.");
            setSharing(false);
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                if (now - lastSentRef.current < MIN_UPDATE_INTERVAL_MS) return;
                lastSentRef.current = now;

                const { latitude, longitude } = position.coords;
                api.put(`/driver/update-driver-location/${orderId}`, {
                    latitude,
                    longitude,
                })
                    .then(() => {
                        setLastSentAt(new Date());
                        setError(null);
                    })
                    .catch(() => setError("Couldn't send location update."));
            },
            () => {
                setError(
                    "Location access denied. Enable it to share your location.",
                );
                setSharing(false);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );

        watchIdRef.current = id;

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [sharing, orderId]);

    const toggle = () => {
        setError(null);
        setSharing((prev) => !prev);
    };

    return { sharing, error, lastSentAt, toggle };
}
