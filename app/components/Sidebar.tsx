import { Link, useLocation } from "react-router";
import {
    HomeIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    CreditCardIcon
} from "@heroicons/react/24/outline";

export const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", path: "/app", icon: HomeIcon },
        { name: "Orders", path: "/app/orders", icon: DocumentTextIcon },
        { name: "Plans", path: "/app/plans", icon: CreditCardIcon },
        { name: "Settings", path: "/app/settings", icon: Cog6ToothIcon },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen flex-shrink-0 flex flex-col fixed left-0 top-0 z-10 transition-all duration-300 shadow-sm">
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    QS Invoices
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== "/app" && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
              `}
                        >
                            <item.icon
                                className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors duration-200 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                    }`}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center px-3 py-2 text-sm text-gray-500 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-50 mr-2" />
                    System Operational
                </div>
            </div>
        </aside>
    );
};
