
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'

import { upsertFeAccount } from '@/lib/feAccounts'
import { reFetch } from '@/lib/reFetch'
import { upsertProject } from '@/lib/virProjects'
import { virApiFetch } from '@/lib/virApiFetch'


  export const metadata = {
    title: 'Map your data',
    description: 'Select which projects should map to which accounts.',
  }
  
  const getVirtuousProjects = async (user) => {
    let projects = await db.virtuousProject.findMany({
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
        teamId: user.team.id,
      },
      orderBy: {
        onlineDisplayName: 'asc',
      },
    })

      if (projects.length < 1) {
        console.log('no initial projects...querying virtuous')
      const body = {
        groups: [
          {
            conditions: [
              {
                parameter: 'Create Date',
                operator: 'LessThanOrEqual',
                value: '30 Days Ago',
              },
              {
                parameter: 'Active',
                operator: 'IsTrue',
              },
            ],
          },
        ],
        sortBy: 'Last Modified Date',
        descending: 'true',
      }
      const res = await virApiFetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', 'POST', user.team.id, body)

      console.log('after virApiFetch')
      console.log(res.status)
      if (res.status !== 200) {
        console.log('no projects')

      }
      console.log('returning data')
      const data = await res.json()
      console.log(data)
      data?.list.forEach((project) => {
        upsertProject(project, user.team.id)
      })
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
          teamId: user.team.id,
        },
        orderBy: {
          onlineDisplayName: 'asc',
        },
      })

    }
   return projects 
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
        teamId: user.team.id,
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
        teamId: user.team.id,
      },
    })
  }


  const getFeAccounts = async (user) => {
    let accounts =  await db.feAccount.findMany({
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
        teamId: user.team.id,
      },
      orderBy: {
        description: 'asc',
      },
    })

    if (accounts && accounts.length < 1) {
      console.log('call blackbaud api')
      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/accounts','GET', user.team.id)
      if (res2.status !== 200) {
        console.log('no accounts found')

      } else { 
        console.log('got accounts')
        const data = await res2.json()
        data?.value.forEach((account) => {
          upsertFeAccount(account, user.team.id)
        })
      }
     return accounts =  await db.feAccount.findMany({
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
          teamId: user.team.id,
        },
        orderBy: {
          description: 'asc',
        },
      })
    }
    return accounts 
  }





export default async function DataMapPage() {
    const user = await getCurrentUser()
    if (!user) { return null}
    const feAccountsData= getFeAccounts(user)
    const projectsData= getVirtuousProjects(user)
    const mappingData= getProjectAccountMappings(user)
    const [projects, feAccounts, mappings] = await Promise.all([projectsData, feAccountsData, mappingData])
    console.log('accounts length: ', feAccounts.length)
    console.log('projects length: ', projects.length)
    


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
    </>
  )
}
