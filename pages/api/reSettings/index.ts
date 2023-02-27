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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)
  console.log('api call reSettings API')
  if (!session) {
    console.log('no session')
    return res.status(403).end()
  }

  const { user } = session
  
  console.log(user)
  if (req.method === 'GET') {
    console.log('api call test - get ')
    try {
      const reSettings = await db.reSettings.findFirst({
        select: {
          id: true,
          environment_name: true,
          legal_entity_id: true,
          email: true,
          expires_in: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(reSettings); 
      if (!reSettings) {
        return {}
      }
    
    console.log('returning something else')
 
     res.status(200).json( reSettings)
    } catch (error) {
      return error
    }
  }

  if (req.method === 'DELETE') {
    console.log('api call test - delete ')
    try {
      const reSettings = await db.reSettings.delete({
        where: {
          userId: user.id,
        },
      })

      console.log(reSettings); 
      if (!reSettings) {
        return res.status(200).end()
      }
    
    console.log('returning something else')
    return res.status(200).end()
  } catch (error) {
    return res.status(400).end(error)
  }
  } 
}

export default withMethods(['GET', 'DELETE'], handler)
