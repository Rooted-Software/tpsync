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


async function upsertGift(gift: string) { await db.giftBatches.upsert({
    where: {
      batch_name: gift || 'none'
    },
    update: {
      batch_name: gift  || 'none',
    },
    create: {
      batch_name: gift  || 'none',
      synced: false,
    },
  })
}
 

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(403).end()
  }

  const { user } = session
  console.log('api - get Virtuous Gifts')
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
      const res2 = await fetch('https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${account.access_token}`
        },
        body:JSON.stringify({
          "groups": [
              {
                  "conditions": [
                      
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
     const unique = [...new Set(data?.list?.map(item => item.batch || 'none'))]; // [ 'A', 'B']
     console.log(unique); 

     unique.forEach((gift: string) => { 
      upsertGift(gift); 
    })
    
    res.status(200).json( data )
    } catch (error) {
      return error
    }
  }
}

export default withMethods(['GET'], handler)
