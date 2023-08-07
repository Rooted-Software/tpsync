
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virFetch } from '@/lib/virFetch'



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous Projects - API Route')
    try {
        const body = null
        const res = await virFetch('https://api.virtuoussoftware.com/api/Organization', 'GET', user.id, body)

          console.log('after virFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
          console.log(data)
          /*
          data?.list.forEach((project) => {
         
          })*/
      return new Response(JSON.stringify(data));
    } catch (error) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}


const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
})


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
  console.log(body)
  const org = {
    "organizationUserId": body.selectValue
  }
  const res2 = await virFetch('https://api.virtuoussoftware.com/api/Organization/Switch', 'PUT', user.id, org)
  const body2 = null
  const res3 = await virFetch('https://api.virtuoussoftware.com/api/Organization/Current', 'GET', user.id, body2)
  console.log('after virFetch of new org ')
  const data = await res3.json()
  console.log(data)
  const userSettings = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      virtuousOrg: data.organizationUserId.toString(),
      virtuousOrgName: data.organizationName,
      virtuousOrgTimeZone: data.organizationTimeZone,
    },
    select: {
      id: true
    }
  })
  
  return new Response(null, { status: 200 })
} catch (error) {
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify(error.issues), { status: 422 })
  }

  return new Response(null, { status: 500 })
}
}