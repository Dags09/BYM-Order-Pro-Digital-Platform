import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import type { Feedback } from "../../../types/feedback";

interface DeleteModalProps {
    feedback: Feedback | null | undefined;
    onClose: () => void;
    onConfirm: () => void;
    deleting: boolean;
}

function FeedbackDeleteModal({
    feedback,
    onClose,
    onConfirm,
    deleting,
}: DeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon
                        icon={faTrash}
                        className="text-red-500 text-xl"
                    />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">
                    Delete Feedback
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    Are you sure you want to delete this feedback from{" "}
                    <span className="font-semibold text-slate-600">
                        {feedback?.customer?.firstName}{" "}
                        {feedback?.customer?.lastName}
                    </span>
                    ? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {deleting && (
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin"
                            />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export { FeedbackDeleteModal };
