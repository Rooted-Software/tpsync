import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import * as z from 'zod'

import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RequiresProPlanError } from '@/lib/exceptions'
import { getUserSubscriptionPlan } from '@/lib/subscription'

const postCreateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
})

async function upsertProject(project) { await db.virtuousProjects.upsert({
    where: {
     id: project.id 
    },
    update: {
      name: project.name,
      projectCode: project.projectCode,
      externalAccountingCode: project.projectCode || 'none',
      onlineDisplayName: project.onlineDisplayName,
      description: project.description,
      isPublic: project.isPublic === 'true',
      isActive: project.isActive === 'true',
      isTaxDeductible: project.isTaxDeductible === 'true',
      giftSpecifications: project.giftSpecifications,
      customFields: project.customFields,
      createdDateTimeUTC: new Date(project.createDateTimeUtc),
      modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
    },
    create: {
      id: project.id,
      name: project.name,
      projectCode: project.projectCode || 'none',
      externalAccountingCode: project.projectCode,
      onlineDisplayName: project.onlineDisplayName,
      description: project.description,
      isPublic: project.isPublic === 'true',
      isActive: project.isActive === 'true',
      isTaxDeductible: project.isTaxDeductible === 'true',
      giftSpecifications: project.giftSpecifications,
      customFields: project.customFields,
      createdDateTimeUTC: new Date(project.createDateTimeUtc),
      modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
    },
  })
}
 



async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(403).end()
  }

  const { user } = session
  console.log('api - get Virtuous Projects')
  console.log(user)
  if (req.method === 'GET') {
    console.log('api call test - get ')
    try {
      const account = await db.account.findFirst({
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_at: true, 
        },
        where: {
          userId: user.id,
        },
      })
      console.log(account); 
      if (!account) {
        return 
      }
      const res2 = await fetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${account.access_token}`
        },
        body:JSON.stringify({
          "groups": [
              {
                  "conditions": [
                    {
                      "parameter": "Create Date",
                      "operator": "LessThanOrEqual",
                      "value": "30 Days Ago",
                  },
                  {
                    "parameter": "Active",
                    "operator": "IsTrue",
                },
                      
                  ]
              }
          ],
          "sortBy": "Last Modified Date",
          "descending": "true"
      }), 
      });
      console.log('after form')
      console.log(res2.status);
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(429).end()
      }
      console.log('returning something else')
     const data=await res2.json(); 
     
     console.log(data);
     data?.list.forEach(project => {
      upsertProject(project); 

     })
    
    res.status(200).json( data )
    } catch (error) {
      return error
    }
  }
}

export default withMethods(['GET'], handler)
