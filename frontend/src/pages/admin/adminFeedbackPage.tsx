import { useEffect, useState } from "react";
import { Star, MessageSquare, Search, Trash2 } from "lucide-react";
import api from "../../lib/axios";
import { formatDateTime } from "../../utils/formatters";
import { Skeleton } from "../../components/skeletonLoader";
import { AdminFeedbackSkeleton } from "../../components/pageComponents/admin/adminPageSkeletons";

interface FeedbackEntry {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    customer?: { firstName: string; lastName: string; email: string } | null;
    order?: { _id: string; totalAmount: number; status: string } | null;
}

type RatingFilter = "all" | 1 | 2 | 3 | 4 | 5;

const RATING_FILTERS: RatingFilter[] = ["all", 5, 4, 3, 2, 1];

function getErrorMessage(err: unknown, fallback: string) {
    const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
    return message ?? fallback;
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                        i < rating ? "fill-signal text-signal" : "text-ink/15"
                    }`}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

export default function AdminFeedbackPage() {
    const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<FeedbackEntry | null>(
        null,
    );
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        api.get("/feedback/get-all-feedback")
            .then(({ data }) => setFeedback(data))
            .catch((err) =>
                setError(getErrorMessage(err, "Couldn't load feedback.")),
            )
            .finally(() => setLoading(false));
    }, []);

    const sorted = [...feedback].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const avgRating =
        sorted.length > 0
            ? sorted.reduce((s, f) => s + f.rating, 0) / sorted.length
            : 0;

    const countFor = (r: RatingFilter) =>
        r === "all"
            ? sorted.length
            : sorted.filter((f) => f.rating === r).length;

    const filtered = sorted
        .filter((f) => ratingFilter === "all" || f.rating === ratingFilter)
        .filter((f) => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            const name = f.customer
                ? `${f.customer.firstName} ${f.customer.lastName}`.toLowerCase()
                : "";
            return (
                name.includes(q) ||
                f.comment.toLowerCase().includes(q) ||
                f.order?._id.toLowerCase().includes(q)
            );
        });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget._id);
        setActionError(null);
        try {
            await api.delete(`/feedback/delete-feedback/${deleteTarget._id}`);
            setFeedback((prev) =>
                prev.filter((f) => f._id !== deleteTarget._id),
            );
            setDeleteTarget(null);
        } catch (err) {
            setActionError(
                getErrorMessage(err, "Couldn't delete this feedback."),
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <AdminFeedbackSkeleton />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-route/20 bg-route/5 p-6 text-route">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                        Feedback
                    </h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Customer reviews left on delivered orders.
                    </p>
                </div>
                {sorted.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-4 py-2 shadow-sm">
                        <Stars rating={Math.round(avgRating)} />
                        <span className="font-display text-sm font-semibold text-ink">
                            {avgRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-ink/40">
                            ({sorted.length})
                        </span>
                    </div>
                )}
            </div>

            {actionError && (
                <div className="rounded-lg border border-route/20 bg-route/5 p-4 text-sm text-route">
                    {actionError}
                </div>
            )}

            <div className="rounded-lg border border-ink/10 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-ink/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-1 rounded-md border border-ink/10 bg-kraft/30 p-1">
                        {RATING_FILTERS.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRatingFilter(r)}
                                className={`rounded-[4px] px-2.5 py-1 text-xs font-medium transition-colors ${
                                    ratingFilter === r
                                        ? "bg-crate text-white"
                                        : "text-ink/60 hover:text-ink"
                                }`}
                            >
                                {r === "all" ? "All" : `${r}★`}
                                <span
                                    className={`ml-1 ${ratingFilter === r ? "text-white/70" : "text-ink/40"}`}
                                >
                                    {countFor(r)}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30"
                            strokeWidth={1.75}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer, comment, or order"
                            className="w-full rounded-md border-2 border-ink/20 bg-kraft/40 py-1.5 pl-8 pr-3 text-xs text-ink outline-none transition focus:border-crate sm:w-64"
                        />
                    </div>
                </div>

                {sorted.length === 0 ? (
                    <div className="p-10 text-center">
                        <MessageSquare
                            className="mx-auto h-8 w-8 text-ink/20"
                            strokeWidth={1.5}
                        />
                        <p className="mt-3 text-sm text-ink/50">
                            No feedback has been submitted yet.
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-ink/50">
                            No feedback matches this filter.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-ink/5">
                        {filtered.map((f) => (
                            <div key={f._id} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Stars rating={f.rating} />
                                            <span className="text-xs text-ink/40">
                                                {formatDateTime(f.createdAt)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm font-medium text-ink">
                                            {f.customer
                                                ? `${f.customer.firstName} ${f.customer.lastName}`
                                                : "Deleted customer"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setDeleteTarget(f)}
                                        disabled={deletingId === f._id}
                                        className="flex shrink-0 items-center gap-1.5 rounded-md border border-ink/15 px-2.5 py-1.5 text-xs font-medium text-ink/60 transition hover:border-route/30 hover:text-route disabled:opacity-50"
                                    >
                                        {deletingId === f._id ? (
                                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                        Remove
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-ink/70">
                                    {f.comment}
                                </p>
                                {f.order && (
                                    <p className="mt-1.5 font-mono text-xs text-ink/40">
                                        Order #
                                        {f.order._id.slice(-6).toUpperCase()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
                        <p className="font-display text-base font-semibold text-ink">
                            Remove this feedback?
                        </p>
                        <p className="mt-1.5 text-sm text-ink/60">
                            This review from{" "}
                            {deleteTarget.customer
                                ? `${deleteTarget.customer.firstName} ${deleteTarget.customer.lastName}`
                                : "this customer"}{" "}
                            will be permanently deleted.
                        </p>
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deletingId === deleteTarget._id}
                                className="flex items-center gap-2 rounded-md bg-route px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                            >
                                {deletingId === deleteTarget._id && (
                                    <Skeleton className="h-4 w-4 rounded-full bg-white/50" />
                                )}
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
