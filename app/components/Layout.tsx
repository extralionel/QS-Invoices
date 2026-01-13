import { ReactNode } from "react";


interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <main className="transition-all duration-300">
                <div className="w-full px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
