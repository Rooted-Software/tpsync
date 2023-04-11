
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import * as React from 'react'

import { ApiCallButton } from '@/components/dashboard/api-call-button'
import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder'
import { DashboardHeader } from '@/components/dashboard/header'
import { KeygenButton } from '@/components/dashboard/keygen-button'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { PostItem } from '@/components/dashboard/post-item'
import { ReGetProjectsButton } from '@/components/dashboard/re-get-projects'
import { ReTestPostButton } from '@/components/dashboard/re-test-post-button'
import { DashboardShell } from '@/components/dashboard/shell'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

const getVirtuousProjects = async () => {
  return await db.virtuousProjects.findMany({
    select: {
      id: true,
      name: true, 
      project_id: true,
      projectCode: true,
      onlineDisplayName: true,
      createdAt: true,
      updatedAt: true, 
    },
    orderBy: {
      onlineDisplayName: 'asc',
    },
  })
}

const getFeProjects = async () => {
  return await db.feProjects.findMany({
    select: {
      id: true,
      project_id: true,
      ui_project_id: true,
      description: true,
      location: true,
      division: true,
      department: true, 
      status: true,
      createdAt: true,
      updatedAt: true, 
    },
    orderBy: {
      description: 'asc',
    },
  })
}

export default async function ProjectsPage() {
  const user = await getCurrentUser()
  const projects = await getVirtuousProjects() || []
  const feProjects = await getFeProjects() || []

  if (!user) {
    redirect(authOptions.pages.signIn)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Projects"
        text="Project Matching Page"
      >
     
      </DashboardHeader>
      <div>
{ projects && feProjects ? <MappingCreateButton projects={projects} feProjects={feProjects} className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" /> : null }
      </div>
      <div className="">Virtuous Test Button
        <ApiCallButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div> 
      <div className="">Virtuous Refresh Button
        <ApiRefreshButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">Test RE  Button
        <ReGetProjectsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div> 
      <div className="">Test RE POST  Button
        <ReTestPostButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div> 
      <div className="">Get Gifts
        <VirtuousGetProjectsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </div> 
      {/*
      <div className="">Test KeyGen
        <KeygenButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </div> */} 
    </DashboardShell>
  )
}
