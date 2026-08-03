import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faComments,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../lib/axios";

import { Stars } from "../../components/admin/Feedback/Stars";
import { RatingBar } from "../../components/admin/Feedback/RatingBar";
import { FeedbackDeleteModal } from "../../components/admin/Feedback/FeedbackDeleteModal";
import { FeedbackCard } from "../../components/admin/Feedback/FeedbackCard";
import type { Feedback } from "../../types/feedback";

type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";
type SortBy = "newest" | "oldest" | "highest" | "lowest";

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRating, setFilterRating] = useState<RatingFilter>("all");
    const [toDelete, setToDelete] = useState<Feedback | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>("newest");

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get("/feedback/get-all-feedback");
            setFeedbacks(res.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleDelete = async () => {
        if (!toDelete) return;
        setDeleting(true);
        try {
            await api.delete(`/feedback/delete-feedback/${toDelete._id}`);
            setFeedbacks((prev) => prev.filter((f) => f._id !== toDelete._id));
            setToDelete(null);
        } catch (e) {
            console.error(e);
        } finally {
            setDeleting(false);
        }
    };

    // ── stats ──────────────────────────────────────────────────────────────
    const total = feedbacks.length;
    const avgRating = total
        ? feedbacks.reduce((s, f) => s + (f.rating ?? 0), 0) / total
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
        rating: r,
        count: feedbacks.filter((f) => f.rating === r).length,
    }));

    // ── filter + sort ──────────────────────────────────────────────────────
    const filtered = feedbacks
        .filter((f) => {
            const matchRating =
                filterRating === "all" || f.rating === Number(filterRating);
            const q = search.toLowerCase();
            const name =
                `${f.customer?.firstName ?? ""} ${f.customer?.lastName ?? ""}`.toLowerCase();
            const matchSearch =
                !q || name.includes(q) || f.comment?.toLowerCase().includes(q);
            return matchRating && matchSearch;
        })
        .sort((a, b) => {
            if (sortBy === "newest")
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            if (sortBy === "oldest")
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
            if (sortBy === "highest") return (b.rating ?? 0) - (a.rating ?? 0);
            if (sortBy === "lowest") return (a.rating ?? 0) - (b.rating ?? 0);
            return 0;
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading feedbacks…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Feedbacks
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {total} total feedbacks
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Average rating */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
                        <div className="text-center flex-shrink-0">
                            <p className="text-5xl font-bold text-slate-800 leading-none">
                                {avgRating.toFixed(1)}
                            </p>
                            <Stars
                                rating={Math.round(avgRating)}
                                size="text-base"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                {total} reviews
                            </p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {ratingCounts.map(({ rating, count }) => (
                                <RatingBar
                                    key={rating}
                                    rating={rating}
                                    count={count}
                                    total={total}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: "5 Star",
                                count: ratingCounts[0].count,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50",
                            },
                            {
                                label: "4 Star",
                                count: ratingCounts[1].count,
                                color: "text-blue-600",
                                bg: "bg-blue-50",
                            },
                            {
                                label: "3 Star",
                                count: ratingCounts[2].count,
                                color: "text-amber-600",
                                bg: "bg-amber-50",
                            },
                            {
                                label: "1-2 Star",
                                count:
                                    ratingCounts[3].count +
                                    ratingCounts[4].count,
                                color: "text-red-500",
                                bg: "bg-red-50",
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className={`${s.bg} rounded-2xl p-4 flex flex-col justify-between`}
                            >
                                <p className={`text-2xl font-bold ${s.color}`}>
                                    {s.count}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Search by name or comment…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Rating filter */}
                    <div className="relative">
                        <select
                            value={filterRating}
                            onChange={(e) =>
                                setFilterRating(e.target.value as RatingFilter)
                            }
                            className="appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Ratings</option>
                            {[5, 4, 3, 2, 1].map((r) => (
                                <option key={r} value={r}>
                                    {r} Star{r !== 1 ? "s" : ""}
                                </option>
                            ))}
                        </select>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                        />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value as SortBy)
                            }
                            className="appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                        <FontAwesomeIcon
                            icon={faChevronDown}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                        />
                    </div>

                    <p className="text-xs text-slate-400 self-center ml-auto">
                        {filtered.length} result
                        {filtered.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <FontAwesomeIcon
                            icon={faComments}
                            className="text-4xl text-gray-200 mb-3"
                        />
                        <p className="text-slate-400 text-sm">
                            No feedbacks found
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((f) => (
                            <FeedbackCard
                                key={f._id}
                                feedback={f}
                                onDelete={setToDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {toDelete && (
                <FeedbackDeleteModal
                    feedback={toDelete}
                    onClose={() => setToDelete(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
        </>
    );
}
