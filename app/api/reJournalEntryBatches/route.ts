
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { reFetch } from '@/lib/reFetch' 

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('GET RE Journal Entry Batches (test) API Route')
    const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/projects','GET', user.id)
    console.log(res2.status)
    if (res2.status !== 200) {
        console.log('returning status')
        return res2;
        }
    console.log('returning something else')
    const data = await res2.json()

    return new Response(JSON.stringify(data));
    } catch (error) {
    if (error instanceof z.ZodError) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}


export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions)
  
      if (!session) {
        return new Response('Unauthorized', { status: 403 })
      }
  
      const { user } = session
      
      const bodyJson = [
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


      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/projects','POST', user.id, bodyJson)


  
      return new Response(JSON.stringify(res2))
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
      }

      return new Response(null, { status: 500 })
    }
  }
