import { useEffect, useRef, useState } from "react";
import useCartStore from "../store/cartStore";
import { RESTORE_DELAY_MS } from "../utils/formatters";

export function useCartLineItem(productId: string, storeQuantity: number) {
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const [override, setOverride] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const commitNow = (value: number) => {
        clearTimer();
        updateQuantity(productId, value);
        setOverride(null);
    };

    const scheduleDecrease = (value: number) => {
        clearTimer();
        setOverride(String(Math.max(value, 0)));
        timerRef.current = setTimeout(() => {
            updateQuantity(productId, value);
            timerRef.current = null;
            setOverride(null);
        }, RESTORE_DELAY_MS);
    };

    const handleIncrease = () => commitNow(storeQuantity + 1);
    const handleDecrease = () => scheduleDecrease(storeQuantity - 1);

    const handleChange = (raw: string) => {
        if (raw === "" || /^\d+$/.test(raw)) {
            setOverride(raw);
        }
    };

    const handleBlur = () => {
        if (override === null) return;
        const parsed = parseInt(override, 10);
        if (isNaN(parsed) || parsed < 0) {
            setOverride(null);
            return;
        }
        if (parsed >= storeQuantity) {
            commitNow(parsed);
        } else {
            scheduleDecrease(parsed);
        }
    };

    return {
        inputValue: override ?? String(storeQuantity),
        handleIncrease,
        handleDecrease,
        handleChange,
        handleBlur,
    };
}
