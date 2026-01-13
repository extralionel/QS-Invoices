import { type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { CheckIcon } from "@heroicons/react/24/solid";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    return null;
};

export default function Plans() {
    const plans = [
        {
            name: "Basic",
            price: "$9.99",
            description: "Essential invoicing for small businesses",
            features: ["Up to 50 invoices/mo", "Basic templates", "Email support", "Standard reports"],
            current: false,
        },
        {
            name: "Pro",
            price: "$29.99",
            description: "Advanced features for growing stores",
            features: ["Unlimited invoices", "Custom branding", "Priority support", "Advanced analytics", "Multi-currency"],
            current: true,
        },
        {
            name: "Enterprise",
            price: "$99.99",
            description: "Complete solution for high volume",
            features: ["Unlimited everything", "Dedicated account manager", "API access", "SSO", "Custom contracts"],
            current: false,
        },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    Simple, transparent pricing
                </h1>
                <p className="mt-4 text-lg text-gray-500">
                    Choose the perfect plan for your business needs. Upgrade or downgrade at any time.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`rounded-2xl border p-8 shadow-sm flex flex-col transition-all duration-200 
              ${plan.current
                                ? 'border-blue-600 shadow-blue-100 ring-1 ring-blue-600'
                                : 'border-gray-200 hover:shadow-md bg-white'
                            }`}
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-gray-500">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-colors
                ${plan.current
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {plan.current ? 'Current Plan' : 'Select Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
