
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { reFetch } from '@/lib/reFetch'               
import { upsertFeAccount } from '@/lib/feAccounts'

const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
  subType: z.string().optional(),
})


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('RE Accounts')
    try {
      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/accounts','GET', user.id)
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res2;
      }
      console.log('returning something else')
      const data = await res2.json()
      data?.value.forEach((account) => {
        upsertFeAccount(account, session.user.id)
      })
      return new Response(JSON.stringify(data.value));
    } catch (error) {
      return error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}


export async function POST(
  req: Request,
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new Response(null, { status: 403 })
    }
  
    const { user } = session
  

    // Get the request body and validate it.
    // TODO: Implement sanitization for content.
  
    const json = await req.json()
    console.log(json)
    
    const body = userUpdateSchema.parse(json)
    console.log('Test Subtype');
    console.log(body.subType); 
    if (body.subType === 'credit') {
      const userSettings = await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          defaultCreditAccount: body.selectValue,
        },
        select: {
          id: true
        }
      })
    } else {
      const userSettings = await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          defaultDebitAccount: body.selectValue,
        },
        select: {
          id: true
        }
      })
    }
    
    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}






