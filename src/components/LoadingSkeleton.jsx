/**
 * Reusable loading skeleton components for consistent loading states
 */

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
        <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="text-right ml-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
}
