import { authOptions } from '@/lib/auth'

import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virApiFetch  } from '@/lib/virApiFetch'
import { upsertProject } from '@/lib/virProjects'


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous Projects - API Route')
    try {
        const body = {
     
          
          }
        const res = await virApiFetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', 'POST', user.team.id, body)

          console.log('after virApiFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
        
          data?.list.forEach((project) => {
           const proj =  upsertProject(project, session.user.team.id)
           console.log(proj)
          })

            /*
          var shapedData: any = []

          data?.list.forEach((project) => {
            shapedData.push({
              teamId: user.team.id,
              id: project.id,
              name: project.name,
              projectCode: project.projectCode || 'none',
              externalAccountingCode: project.externalAccountingCode,
              onlineDisplayName: project.onlineDisplayName,
              description: project.description,
              isPublic: project.isPublic === true,
              isActive: project.isActive === true,
              isTaxDeductible: project.isTaxDeductible === true,
              giftSpecifications: project.giftSpecifications,
              customFields: project.customFields,
              createdDateTimeUTC: new Date(project.createDateTimeUtc),
              modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
              }
            )
           const proj =  insertManyProject(shapedData, session.user.team.id)
          })
          */
      return new Response(JSON.stringify(data.list));
    } catch (error) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}