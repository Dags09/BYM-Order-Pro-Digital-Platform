import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface RatingBarProps {
    rating: number;
    count: number;
    total: number;
}

function RatingBar({ rating, count, total }: RatingBarProps) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-4 text-right">
                {rating}
            </span>
            <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" />
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                    className="h-2 rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-slate-400 w-6">{count}</span>
        </div>
    );
}

export { RatingBar };
