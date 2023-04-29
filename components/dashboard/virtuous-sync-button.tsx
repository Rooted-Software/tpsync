'use client'

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface SyncButtonProps extends React.HTMLAttributes<HTMLFormElement> {
  batch_name: string
}

export function VirtuousSyncButton({
  batch_name,
  className,
  ...props
}: SyncButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [giftCount, setGiftCount] = React.useState<string>('')
  async function onClick() {
    setIsLoading(true)
    setGiftCount('Loading...')
    const response = await fetch('/api/syncGifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_name: batch_name }),
    })

    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your gifts were not synced. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()

    console.log(data)
    if (data?.list) {
      setGiftCount(data?.list.length)
    } else {
      setGiftCount('gifts')
    }
    // This forces a cache invalidation.
    router.refresh()
  }

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          },
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.add className="mr-2 h-4 w-4" />
        )}
        Sync
      </button>
      <div>Gifts: {giftCount}</div>
    </div>
  )
}
