import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCircle,
    faTruck,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import { STATUS_CONFIG, ALL_STATUSES, steps } from "../../../utils/constants";
import type { Order } from "../../../types/orders";

export function DeliveryTracker({
    order,
}: {
    order: Order | null | undefined;
}) {
    if (!order) return null;
    const currentStep = ALL_STATUSES.indexOf(order.status);
    const cfg =
        STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ??
        STATUS_CONFIG.pending;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
                        Your Next Delivery
                    </p>
                    <p className={`text-lg font-bold ${cfg.color}`}>
                        {cfg.label}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                        #{order._id.slice(-8).toUpperCase()}
                    </p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                >
                    {cfg.label}
                </span>
            </div>

            <div className="flex items-center gap-0 mb-4">
                {steps.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    const isLast = i === steps.length - 1;
                    return (
                        <div
                            key={step.key}
                            className="flex items-center flex-1 last:flex-none"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition
                                    ${done ? "bg-green-700 text-white" : "bg-gray-100 text-gray-300"}
                                    ${active ? "ring-2 ring-green-300 ring-offset-1" : ""}`}
                                >
                                    <FontAwesomeIcon
                                        icon={done ? faCheckCircle : faCircle}
                                    />
                                </div>
                                <p
                                    className={`text-xs text-center leading-tight w-16 ${done ? "text-slate-600 font-medium" : "text-slate-300"}`}
                                >
                                    {step.label}
                                </p>
                            </div>
                            {!isLast && (
                                <div
                                    className={`flex-1 h-0.5 mb-5 mx-1 rounded ${i < currentStep ? "bg-green-600" : "bg-gray-100"}`}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {order.driver && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-3">
                    <FontAwesomeIcon
                        icon={faTruck}
                        className="text-blue-500 text-sm"
                    />
                    <p className="text-xs text-blue-700 font-medium">
                        Driver: {order.driver.firstName} {order.driver.lastName}
                        {order.driver.phoneNumber &&
                            ` · ${order.driver.phoneNumber}`}
                    </p>
                </div>
            )}
            {order.scheduledDeliveryDate && (
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
                    <FontAwesomeIcon
                        icon={faClock}
                        className="text-amber-500 text-sm"
                    />
                    <p className="text-xs text-amber-700 font-medium">
                        Scheduled:{" "}
                        {new Date(order.scheduledDeliveryDate).toLocaleString(
                            "en-PH",
                            {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            },
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

export default { DeliveryTracker };
