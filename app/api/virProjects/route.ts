import { authOptions } from '@/lib/auth'

import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virFetch  } from '@/lib/virFetch'
import { upsertProject } from '@/lib/virProjects'


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous Projects - API Route')
    try {
        const body = {
     
          
          }
        const res = await virFetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', 'POST', user.id, body)

          console.log('after virFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
          console.log(data)
          data?.list.forEach((project) => {
            upsertProject(project, session.user.id)
          })
      return new Response(JSON.stringify(data.list));
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