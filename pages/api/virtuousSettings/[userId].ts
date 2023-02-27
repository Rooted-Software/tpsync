import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import * as z from 'zod'

import { withCurrentUser } from '@/lib/api-middlewares/with-current-user'
import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiKeySchema } from '@/lib/validations/apiKey'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    try {
      const session = await unstable_getServerSession(req, res, authOptions)
      const user = session?.user

      const body = req.body
      console.log(body)
      if (body?.apiKey) {
        const payload = apiKeySchema.parse(body)
        console.log(payload)
        //do we need to sanatize the data? 
        const setting = await db.apiSettings.upsert({
          where: {
            userId: user.id,
          },
          update: {
            virtuousAPI: body.apiKey,
          },
          create: {
            userId: user.id,
            virtuousAPI: body.apiKey,
          },
        })
        return res.json(setting)
      }
      return res.end()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues)
      }

      return res.status(422).end()
    }
  }
}

export default withMethods(['PATCH'], withCurrentUser(handler))
