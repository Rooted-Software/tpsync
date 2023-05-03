import { apiKeySchema } from '@/lib/validations/apiKey'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

import { getServerSession } from 'next-auth'

import * as z from 'zod'



export async function PATCH(
    req: Request,

  ) {
    console.log('APR Route Vir Settings')
    try {
      // Validate route params.

      const session = await getServerSession(authOptions)

      if (!session?.user || !session?.user.email) {
        return new Response(null, { status: 403 })
      }
      const { user } = session
   
      // Get the request body and validate it.
      const json = await req.json()
      console.log('getting json')
      console.log(json)
      const body = apiKeySchema.parse(json)
      console.log(body) 
      // Update the post.
      // TODO: Implement sanitization for content.
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
      console.log(setting)
      return new Response(JSON.stringify(setting), { status: 200 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error)
        return new Response(JSON.stringify(error.issues), { status: 422 })
      }
  
      return new Response(null, { status: 500 })
    }
  }

