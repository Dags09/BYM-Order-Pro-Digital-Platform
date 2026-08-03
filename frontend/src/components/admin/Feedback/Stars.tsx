import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface StarsProps {
    rating: number;
    size?: string;
}

function Stars({ rating, size = "text-sm" }: StarsProps) {
    return (
        <div className={`flex items-center gap-0.5 ${size}`}>
            {Array.from({ length: 5 }, (_, i) => (
                <FontAwesomeIcon
                    key={i}
                    icon={i < rating ? faStar : faStarEmpty}
                    className={i < rating ? "text-amber-400" : "text-gray-200"}
                />
            ))}
        </div>
    );
}

export { Stars };
