'use client'

import { ReGetProjectsButton } from '@/components/dashboard/re-get-projects'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface MappingCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  projects: []
  feProjects: []
}

export function MappingCreateButton({
  projects,
  feProjects,
  className,
  ...props
}: MappingCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [virProjectID, setVirProjectID] = React.useState('')
  const [feProjectID, setFeProjectID] = React.useState('')

  async function onClick() {
    setIsLoading(true)

    const response = await fetch('/api/mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        virProjectID: virProjectID,
        feProjectID: feProjectID,
      }),
    })

    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Limit of 3 posts reached.',
          description: 'Please upgrade to the PRO plan.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }

    const post = await response.json()

    // This forces a cache invalidation.
    router.refresh()
  }

  return (
    <div>
      {projects?.length ? (
        <select
          name="virtuousProjects"
          id="virtuousProjects"
          onChange={(e) => setVirProjectID(e.target.value)}
          value={virProjectID}
        >
          {projects.map((project) => (
            <option key={project.project_id} value={project.project_id}>
              {project.onlineDisplayName
                ? project.onlineDisplayName
                : project.name}
            </option>
          ))}
        </select>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
            No Virtuous Projects Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any Virtuous projects yet. Start creating
            content.
          </EmptyPlaceholder.Description>
          <VirtuousGetProjectsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </EmptyPlaceholder>
      )}
      {feProjects?.length ? (
        <select
          name="feProjects"
          id="feProjects"
          onChange={(e) => setFeProjectID(e.target.value)}
          value={feProjectID}
        >
          {feProjects.map((feProject) => (
            <option key={feProject.id} value={feProject.id}>
              {feProject.description
                ? feProject.description
                : feProject.ui_project_id}
            </option>
          ))}
        </select>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
            No Virtuous Projects Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any RE/FE projects yet.
          </EmptyPlaceholder.Description>
          <ReGetProjectsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </EmptyPlaceholder>
      )}

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
        Create Mapping
      </button>
    </div>
  )
}
