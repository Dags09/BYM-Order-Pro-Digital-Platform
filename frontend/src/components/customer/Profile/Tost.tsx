import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck,
    faXmark,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { ToastType } from "../../types/ui";

interface ToastProps {
    msg: string;
    type: ToastType;
    onClose: () => void;
}

function Toast({ msg, type, onClose }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white
            ${type === "success" ? "bg-green-700" : "bg-red-500"}`}
        >
            <FontAwesomeIcon
                icon={
                    type === "success" ? faCircleCheck : faTriangleExclamation
                }
            />
            {msg}
            <button
                onClick={onClose}
                className="ml-2 opacity-70 hover:opacity-100"
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    );
}
export { Toast };
