import { ProfileHeaderSkeleton, CreditsListSkeleton, FormSkeleton } from '@/components/ui/Skeleton'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <ProfileHeaderSkeleton />
        <CreditsListSkeleton />
        <div className="mt-8">
          <FormSkeleton />
        </div>
      </div>
    </div>
  )
}
