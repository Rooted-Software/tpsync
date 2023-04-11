'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { toast } from '@/ui/toast'

interface ReGetProjectsButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function ReGetProjectsButton({
  className,
  ...props
}: ReGetProjectsButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [projects, setProjects] = React.useState([]); 
  async function onClick() {
    setIsLoading(true)
    setProjects(null);
    const response = await fetch('/api/reGetProjects', {
      method: 'GET',
 
    })

    setIsLoading(false)
    console.log(response)
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
    if (data?.value?.length >0) {
      setProjects(data.value)
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
      Get RE Projects 
    </button>
    {projects && projects.length > 0 ? <div>  
        {projects?.map((project, index) =>  <div key={index} className="mt-2">{project.description} : {project.status}</div>)}
         </div> : null}
    </div>
  )
}
