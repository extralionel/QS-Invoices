import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import {
  BanknotesIcon,
  DocumentCheckIcon,
  ClockIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

import type { LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Dashboard() {
  const stats = [
    { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: BanknotesIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Invoices Generated', value: '2,345', change: '+15.2%', icon: DocumentCheckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Pending Payment', value: '$12,500.00', change: '-3.2%', icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { name: 'Active Plans', value: '523', change: '+5.4%', icon: UserGroupIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <span className="text-sm text-gray-500 self-center">Last updated: Just now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {item.change}
              </span>
              <span className="ml-2 text-gray-400">from last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                        INV
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Invoice #10{i}34 generated
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Sent to customer@example.com
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sent
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <DocumentCheckIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Create Invoice</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <UserGroupIcon className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Add Customer</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all group">
              <BanknotesIcon className="h-8 w-8 text-gray-400 group-hover:text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-green-700">Record Payment</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all group">
              <ClockIcon className="h-8 w-8 text-gray-400 group-hover:text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">Reminder</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
