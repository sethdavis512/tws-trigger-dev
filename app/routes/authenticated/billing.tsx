import type { Route } from "./+types/billing";
import { Link, Outlet } from "react-router";
import { auth } from "~/lib/auth.server";
import { getSubscriptionCredits } from "~/models/credit.server";

export async function loader({ request }: Route.LoaderArgs) {
  // User is guaranteed to be authenticated by parent layout
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session!.user;
  
  const credits = await getSubscriptionCredits(user.id);
  
  return { user, credits };
}

export default function Billing({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Billing & Credits
          </h1>
          
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            <div className="border border-gray-200 dark:border-gray-600 rounded p-3">
              <h3 className="text-xs font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                Current Plan
              </h3>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {loaderData.credits.subscription ? `${loaderData.credits.tier.charAt(0).toUpperCase() + loaderData.credits.tier.slice(1)} Plan` : 'Free Plan'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {loaderData.credits.subscription 
                  ? `${loaderData.credits.remaining}/${loaderData.credits.monthlyAllowance} monthly credits remaining`
                  : `${loaderData.credits.purchasedCredits} purchased credits available`
                }
              </p>
            </div>
            
            {loaderData.credits.subscription && (
              <div className="border border-gray-200 dark:border-gray-600 rounded p-3">
                <h3 className="text-xs font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                  Subscription
                </h3>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Active
                </p>
                <Link 
                  to="/billing/portal"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Manage subscription →
                </Link>
              </div>
            )}
          </div>

          {/* Credit Purchase Options */}
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Purchase Credits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <CreditPackCard 
              title="Starter Pack"
              credits={50}
              price={4.99}
              description="Perfect for trying out AI generation"
              productId="prod_starter_50"
            />
            <CreditPackCard 
              title="Power Pack"
              credits={200}
              price={14.99}
              description="Great for regular users"
              productId="prod_power_200"
              popular
            />
            <CreditPackCard 
              title="Pro Monthly"
              credits={500}
              price={24.99}
              description="Unlimited generation + priority support"
              productId="prod_pro_500"
              subscription
            />
          </div>
        </div>
        
        {/* Child routes will render here */}
        <Outlet />
      </div>
    </div>
  );
}

function CreditPackCard({ 
  title, 
  credits, 
  price, 
  description, 
  productId,
  popular = false,
  subscription = false 
}: {
  title: string;
  credits: number;
  price: number;
  description: string;
  productId: string;
  popular?: boolean;
  subscription?: boolean;
}) {
  const checkoutUrl = `/billing/checkout?products=${productId}`;
  
  return (
    <div className={`border rounded p-3 relative ${
      popular 
        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
        : 'border-gray-200 dark:border-gray-600'
    }`}>
      {popular && (
        <span className="absolute -top-2 left-3 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
          Most Popular
        </span>
      )}
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {subscription ? `${credits} credits/month` : `${credits} credits`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {description}
          </p>
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            ${price}
          </span>
          {subscription && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              /month
            </span>
          )}
        </div>
        
        <Link 
          to={checkoutUrl}
          className={`w-full h-9 inline-flex items-center justify-center gap-1.5 rounded border text-xs font-medium ${
            popular
              ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {subscription ? 'Subscribe' : 'Purchase'}
        </Link>
      </div>
    </div>
  );
}