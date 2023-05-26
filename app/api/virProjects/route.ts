import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virFetch  } from '@/lib/virFetch'

async function upsertProject(project, userId) {
    await db.virtuousProject.upsert({
      where: {
        userId_id: { 
          userId: userId, 
          id: project.id,
        }
        
      },
      update: {
        name: project.name,
        projectCode: project.projectCode,
        externalAccountingCode: project.externalAccountingCode || 'none',
        onlineDisplayName: project.onlineDisplayName,
        description: project.description,
        isPublic: project.isPublic === true,
        isActive: project.isActive === true,
        isTaxDeductible: project.isTaxDeductible === true,
        giftSpecifications: project.giftSpecifications,
        customFields: project.customFields,
        createdDateTimeUTC: new Date(project.createDateTimeUtc),
        modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
      },
      create: {
        userId: userId,
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
      },
    })
  }

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
        const res = await virFetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', 'POST', user.id, body)

          console.log('after virFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
          console.log(data)
          data?.list.forEach((project) => {
            upsertProject(project, session.user.id)
          })
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