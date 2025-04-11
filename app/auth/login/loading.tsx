import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-6" />
          <Skeleton className="mx-auto h-8 w-[200px]" />
          <Skeleton className="mx-auto h-4 w-[300px]" />
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <Skeleton className="w-full h-[1px]" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="mx-auto h-4 w-[250px]" />
      </div>
    </div>
  )
}

