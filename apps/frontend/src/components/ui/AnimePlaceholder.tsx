import { Skeleton } from "@/components/ui/skeleton"

export function AnimePlaceholder() {
  return (
    <div className="flex flex-row gap-4 mt-4">
      <Skeleton className="w-[200px] h-[250px]" />
      <div className="flex flex-col gap-4 p-2">
        <Skeleton className="w-[300px] h-[20px]" />
        <Skeleton className="w-[150px] h-[20px]" />
      </div>
    </div>
  )
}