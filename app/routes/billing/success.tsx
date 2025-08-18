import type { Route } from "./+types/success";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const checkoutId = url.searchParams.get('checkout_id');
  const userId = url.searchParams.get('user');
  
  return { 
    success: true, 
    checkoutId, 
    userId 
  };
}

export default function Success({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          Purchase Successful!
        </h1>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your credits have been added to your account and you can start generating images immediately.
        </p>
        
        <div className="flex flex-col gap-2 pt-4">
          <Link 
            to="/authenticated/library"
            className="inline-flex items-center justify-center h-9 px-4 rounded border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900"
          >
            Start Generating Images
          </Link>
          
          <Link 
            to="/authenticated/billing"
            className="inline-flex items-center justify-center h-9 px-4 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View Billing Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}