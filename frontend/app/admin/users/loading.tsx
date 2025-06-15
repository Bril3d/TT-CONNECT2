export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between mb-6">
          <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
