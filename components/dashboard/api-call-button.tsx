'use client'

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface PostCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function ApiCallButton({ className, ...props }: PostCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [organizationName, setOrganizationName] = React.useState<string>('')
  const [success, setSuccess] = React.useState<boolean>(false)
  async function onClick() {
    setIsLoading(true)
    setOrganizationName('Loading...')
    const response = await fetch('/api/virOrg', {
      method: 'GET',
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
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()

    console.log(data)
    if (data?.organizationName) {
      setOrganizationName(data.organizationName)
      setSuccess(true)
    }

    // This forces a cache invalidation.
    router.refresh()
  }

  async function ContinueOnClick() {
    setIsLoading(true)
    router.push('/step2')
  }


  return (
    <div>
      {!success  ? <button
        onClick={onClick}
        className={cn(
          'hover:bg- relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          })}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.chevronRight className="mr-2 h-4 w-4" />
        )}
        Test Virtuous API Call
      </button> : <button
        onClick={ContinueOnClick}
        className={cn(
          'hover:bg- relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          })}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.chevronRight className="mr-2 h-4 w-4" />
        )}
        Success:  Click to Continue
      </button>}
      <div>Organization Name: {organizationName}</div>
    </div>
  )
}
