'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { toast } from '@/ui/toast'

interface PostCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function VirtuousGetGiftsButton({
  className,
  ...props
}: PostCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [organizationName, setOrganizationName] = React.useState<string>(''); 
  async function onClick() {
    setIsLoading(true)
    setOrganizationName('Loading...');
    const response = await fetch('/api/getGifts', {
      method: 'GET',
 
    })

    setIsLoading(false)
    
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json(); 
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          message: data.message,
          type: 'error',
        })
      }

      return toast({
        title: 'Something went wrong.',
        message: 'Your post was not created. Please try again.',
        type: 'error',
      })
    }

    const data = await response.json()
  
    console.log(data)
    if (data[0]?.organizationName) {
      setOrganizationName(data[0].organizationName) 
    } else { 
        setOrganizationName('gifts'); 
    }
    // This forces a cache invalidation.
    router.refresh()
  }

  return (<div>
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
      Test Virtuous API Call
    </button>
    <div>Organization Name: { organizationName }</div>
    </div>
  )
}
