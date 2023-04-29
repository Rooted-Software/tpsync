import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RequiresProPlanError } from '@/lib/exceptions'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { isNullOrUndefined } from 'util'
import * as z from 'zod'

async function upsertProject(project) {
  await db.feProjects.upsert({
    where: {
      project_id: project.project_id,
    },
    update: {
      projectCode: project.projectCode,
      ui_project_id: project.ui_project_id,
      start_date: new Date(project.start_date),
      end_date: new Date(project.end_date),
      location: project.location,
      division: project.division,
      department: project.division,
      type: project.type,
      status: project.status,
      prevent_data_entry: project.prevent_data_entry,
      prevent_posting_after: project.prevent_posting_after,
      posting_date: project.posting_date
        ? new Date(project.posting_date)
        : null,
      account_restrictions: project.account_restrictions,
      customFields: project.customFields,
      added_by: project.added_by,
      modified_by: project.modified_by,
      date_added: project.date_added ? new Date(project.date_added) : null,
      date_modified: project.date_modified
        ? new Date(project.date_modified)
        : null,
    },
    create: {
      project_id: project.project_id,
      projectCode: project.projectCode,
      ui_project_id: project.ui_project_id,
      start_date: new Date(project.start_date),
      end_date: new Date(project.end_date),
      location: project.location,
      division: project.division,
      department: project.division,
      type: project.type,
      status: project.status,
      prevent_data_entry: project.prevent_data_entry,
      prevent_posting_after: project.prevent_posting_after,
      posting_date: project.posting_date
        ? new Date(project.posting_date)
        : null,
      account_restrictions: project.account_restrictions,
      customFields: project.customFields,
      added_by: project.added_by,
      modified_by: project.modified_by,
      date_added: project.date_added ? new Date(project.date_added) : null,
      date_modified: project.date_modified
        ? new Date(project.date_modified)
        : null,
    },
  })
}

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
  console.log('RE Projects test')
  console.log(user)
  if (req.method === 'GET') {
    console.log('RE Projects - get ')
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
      console.log(data.value)
      data?.value.forEach((project) => {
        upsertProject(project)
      })
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
      const bodyStuff = {
        type_code: 'Debit',
        account_number: '01-1000-00',
        post_date: '2018-07-02T00:00:00Z',
        encumbrance: 'Regular',
        journal: 'Journal Entry',
        reference: 'Debit reference',
        amount: 10.0,
        notes: 'New Note',
        distributions: [
          {
            ui_project_id: '1100',
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
            ui_project_id: '1200',
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
        custom_fields: [
          {
            field_name: 'Unique Auth Text',
            value: 'My text',
            comments: 'a comment',
            date: '2018-07-02T00:00:00Z',
          },
        ],
      }
      const res2 = await fetch(
        'https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches/2527/journalentries',
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
      const data = await res2.json()
      console.log(data)

      res.status(200).json(data)
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
