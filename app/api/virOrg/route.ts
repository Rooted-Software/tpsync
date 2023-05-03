
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
    console.log('Virtuous Orgs - API Route')
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
      console.log(account)
      if (!account) {
        return
      }
      const res2 = await fetch(
        'https://api.virtuoussoftware.com/api/Organization',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${account.access_token}`,
          },
        }
      )
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res2;
      }
      console.log('returning something else')
      const data = await res2.json()

      return new Response(JSON.stringify(data));
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




  