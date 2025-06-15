import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-[180px]" />
                  <Skeleton className="h-10 w-[180px]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex">
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                    <Skeleton className="h-12 w-1/4" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
