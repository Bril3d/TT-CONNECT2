export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>

        <div className="flex justify-between mb-6">
          <div className="h-10 w-1/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-1/4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-start">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
              <div className="flex justify-end mt-3 space-x-2">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
