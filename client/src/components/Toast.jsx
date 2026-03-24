import React from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "../context/useToast";

const Toast = () => {
    const { toasts, removeToast } = useToast();

    const bgColors = {
        success: "bg-emerald-600",
        error: "bg-red-600",
        info: "bg-blue-600",
        warning: "bg-yellow-600",
    };

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        info: <Info size={20} />,
        warning: <AlertCircle size={20} />,
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${bgColors[toast.type] || bgColors.info} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto cursor-pointer hover:shadow-xl transition-shadow`}
                    onClick={() => removeToast(toast.id)}
                    role="alert"
                >
                    {icons[toast.type] || icons.info}
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            ))}
        </div>
    );
};

export default Toast;
