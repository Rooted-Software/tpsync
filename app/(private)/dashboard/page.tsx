import { ApiCallButton } from '@/components/dashboard/api-call-button'
import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { KeygenButton } from '@/components/dashboard/keygen-button'
import { ReTestApiButton } from '@/components/dashboard/re-test-button'
import { ReTestPostButton } from '@/components/dashboard/re-test-post-button'
import { VirtuousGetGiftsButton } from '@/components/dashboard/virtuous-get-gifts'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { DashboardHeader } from '@/components/header'
import { PostCreateButton } from '@/components/post-create-button'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const posts = await db.post.findMany({
    where: {
      authorId: user.id,
    },
    select: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Test Various API Calls"
      ></DashboardHeader>
      <div>
        {posts?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No posts created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any posts yet. Start creating content.
            </EmptyPlaceholder.Description>
            <PostCreateButton variant="outline" />
          </EmptyPlaceholder>
        )}
      </div>
      <div className="">
        Virtuous Test Button
        <ApiCallButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Virtuous Refresh Button
        <ApiRefreshButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Test RE Button
        <ReTestApiButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Test RE POST Button
        <ReTestPostButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Get Gifts
        <VirtuousGetGiftsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      {/*
      <div className="">Test KeyGen
        <KeygenButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </div> */}
    </DashboardShell>
  )
}
