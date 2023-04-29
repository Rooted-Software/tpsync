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
  console.log('api call test')
  console.log(user)
  if (req.method === 'GET') {
    console.log('RE Test API - get ')
    try {
      const reSettings = await db.reSettings.findFirst({
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_in: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(reSettings)
      if (!reSettings) {
        return res.status(429).end()
      }
      const res2 = await fetch(
        'https://api.sky.blackbaud.com/generalledger/v1/projects',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${reSettings.access_token}`,
            'Bb-Api-Subscription-Key': process.env.AUTH_SUBSCRIPTION_KEY,
          },
        }
      )
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(res2.status).end()
      }
      console.log('returning something else')
      const data = await res2.json()
      console.log(data)
      res.status(200).json(data)
    } catch (error) {
      return error
    }
  }

  if (req.method === 'POST') {
    console.log('RE Test API - post ')
    try {
      const reSettings = await db.reSettings.findFirst({
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_in: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(reSettings)
      if (!reSettings) {
        return res.status(429).end()
      }
      const bodyStuff = [
        {
          type_code: 'Debit',
          account_number: '01-1000-00-000000',
          post_date: '2018-07-02T00:00:00Z',
          encumbrance: 'Regular',
          journal: 'Journal Entry',
          reference: 'Debit reference',
          amount: 10.0,
          notes: 'New Note',
          distributions: [
            {
              ui_project_id: '2400',
              account_class: 'Unrestricted Net Assets',
              transaction_code_values: [
                {
                  name: 'Grants',
                  value: 'None',
                  id: 0,
                },
                {
                  name: 'Spendable?',
                  value: 'Spendable',
                  id: 0,
                },
              ],
              amount: 5.0,
              percent: 50.0,
            },
            {
              ui_project_id: '2400',
              account_class: 'Unrestricted Net Assets',
              transaction_code_values: [
                {
                  name: 'Grants',
                  value: 'None',
                  id: 0,
                },
                {
                  name: 'Spendable?',
                  value: 'Non spendable',
                  id: 0,
                },
              ],
              amount: 5.0,
              percent: 50.0,
            },
          ],
          custom_fields: [],
        },
      ]
      const res2 = await fetch(
        'https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches/2500/journalentries',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${reSettings.access_token}`,
            'Bb-Api-Subscription-Key': process.env.AUTH_SUBSCRIPTION_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyStuff),
        }
      )
      console.log('after form')
      console.log(res2.status)
      console.log(res2)
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(res2.status).end()
      }
      console.log('returning something else')

      res.status(200).json({ message: 'Success' })
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
