import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RequiresProPlanError } from '@/lib/exceptions'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import * as z from 'zod'

const postCreateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
})

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(403).end()
  }

  const { user } = session
  console.log('api refresh test')
  console.log(user)
  if (req.method === 'GET') {
    console.log('api refresh test - get ')
    try {
      const account = await db.account.findFirst({
        select: {
          id: true,
          userId: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(account)
      if (!account) {
        return
      }

      const res2 = await fetch('https://api.virtuoussoftware.com/Token', {
        method: 'POST',
        body: 'grant_type=refresh_token&refresh_token=' + account.refresh_token,
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'form-data',
        },
      })
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(429).end()
      }
      console.log('returning something else')
      const data = await res2.json()
      console.log(data)
      const updatedAccount = await db.account.updateMany({
        where: {
          userId: account.userId,
          type: 'oauth',
          provider: 'virtuous',
        },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_in,
          token_type: 'bearer',
        },
      })

      res.status(200).json(data)
    } catch (error) {
      return error
    }
  }

  if (req.method === 'POST') {
    try {
      const subscriptionPlan = await getUserSubscriptionPlan(user.id)

      // If user is on a free plan.
      // Check if user has reached limit of 3 posts.
      if (!subscriptionPlan?.isPro) {
        const count = await db.post.count({
          where: {
            authorId: user.id,
          },
        })

        if (count >= 3) {
          throw new RequiresProPlanError()
        }
      }

      const body = postCreateSchema.parse(req.body)

      const post = await db.post.create({
        data: {
          title: body.title,
          content: body.content,
          authorId: session.user.id,
        },
        select: {
          id: true,
        },
      })

      return res.json(post)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues)
      }

      if (error instanceof RequiresProPlanError) {
        return res.status(402).end()
      }

      return res.status(500).end()
    }
  }
}

export default withMethods(['GET', 'POST'], handler)
