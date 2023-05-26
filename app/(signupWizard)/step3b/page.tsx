import { RESettingsForm } from '@/components/dashboard/re-settings'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { UniversalSelect } from '@/components/dashboard/universal-select'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { UserAuthForm } from '@/components/user-auth-form'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Stepper } from '@/components/stepper'
import { DashboardNav } from '@/components/dashboard/nav'
import { dashboardConfig } from '@/config/dashboard'
import { absoluteUrl } from '@/lib/utils'


  export const metadata = {
    title: 'Map your data',
    description: 'Select which projects should map to which accounts.',
  }
  
  const getVirtuousProjects = async (user) => {
    return await db.virtuousProject.findMany({
      select: {
        id: true,
        name: true,
        project_id: true,
        projectCode: true,
        onlineDisplayName: true,
        externalAccountingCode: true,
        description: true,
        isActive: true,
        isPublic: true, 
        isTaxDeductible: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        onlineDisplayName: 'asc',
      },
    })
  }
  
  const getFeProjects = async (user) => {
    return await db.feProject.findMany({
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
      where: {
        userId: user.id,
      },
      orderBy: {
        description: 'asc',
      },
    })
  }

  const getProjectAccountMappings = async (user) => {
    return await db.projectAccountMapping.findMany({
      select: {
        id: true,
        virProjectId: true,
        feAccountId: true,
        
      }, 
      where: {
        userId: user.id,
      },
    })
  }


  const getFeAccounts = async (user) => {
    return await db.feAccount.findMany({
      select: {
        account_id: true,
        account_number: true,       
        description: true,          
        class: true,
        cashflow: true,
        working_capital: true,
        default_transaction_codes: true, 
    
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        description: 'asc',
      },
    })
  }


export default async function DataMapPage() {
    const user = await getCurrentUser()
    const feAccountsData= getFeAccounts(user)
    const projectsData= getVirtuousProjects(user)
    const mappingData= getProjectAccountMappings(user)
    const [projects, feAccounts, mappings] = await Promise.all([projectsData, feAccountsData, mappingData])
  return (<>
    <div className="container grid w-screen  grid-cols-3  flex-col items-center bg-dark  lg:max-w-none lg:grid-cols-3 lg:px-0">
    {projects && feAccounts ? (
          <MappingCreateButton
            projects={projects}
            feAccounts={feAccounts}
            mappings={mappings}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : `getting projects and accounts...`}
      
     
    </div>
    <Stepper percent={100} />
    </>
  )
}
