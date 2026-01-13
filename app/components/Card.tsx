import React, { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    action?: ReactNode;
    padding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, action, padding = true }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md overflow-hidden ${className}`}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                    {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={padding ? "p-6" : ""}>
                {children}
            </div>
        </div>
    );
};
