import { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/authStore";

export function useSearchHistory() {
    const { user } = useAuthStore();
    const [search, setSearch] = useState("");
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user?._id) return;
        try {
            const stored = sessionStorage.getItem(`search_history_${user._id}`);
            setSearchHistory(stored ? JSON.parse(stored) : []);
        } catch {
            setSearchHistory([]);
        }
    }, [user?._id]);

    useEffect(
        () => () => {
            if (searchTimer.current) {
                clearTimeout(searchTimer.current);
            }
        },
        [],
    );

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }
        if (val.trim().length < 2) return;

        searchTimer.current = setTimeout(() => {
            setSearchHistory((prev) => {
                const term = val.trim().toLowerCase();
                const updated = [term, ...prev.filter((t) => t !== term)].slice(
                    0,
                    30,
                );
                try {
                    if (user?._id) {
                        sessionStorage.setItem(
                            `search_history_${user._id}`,
                            JSON.stringify(updated),
                        );
                    }
                } catch {
                    // ignore storage errors
                }
                return updated;
            });
        }, 600);
    };

    return { search, searchHistory, handleSearchChange };
}
