import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { postPatchSchema } from '@/lib/validations/post'
import { getServerSession } from 'next-auth'
import * as z from 'zod'

const mappingCreateSchema = z.object({
    virProjectIDs: z.string().array(),
    feAccountID: z.string().optional(),
  })


  async function upsertMapping(virProjectID, feAccountID, userId) {
    await db.projectAccountMapping.upsert({
      where: {
        virProjectId_userId: { 
        virProjectId:  virProjectID,
        userId: userId
        }
      },
      update: {
        feAccountId: parseInt(feAccountID),
      },
      create: {
        virProjectId:  virProjectID,
        feAccountId: parseInt(feAccountID),
        userId: userId
      },
    })
  }

export async function GET(
  req: Request,
) {
  try {
    // Validate the route params.
    const session = await getServerSession(authOptions)
    if (!session) {
        return new Response(null, { status: 403 })
    }
    const { user } = session

    const mappings = await db.projectAccountMapping.findMany({
        select: {
          id: true,
          virProjectId: true,
          feAccountId: true,
      
        },
        where: {
          userId: user.id,
        },
      })
      return new Response(JSON.stringify(mappings))
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
  console.log('mapping - post')
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new Response(null, { status: 403 })
    }
  
    const { user } = session
  
    const json = await req.json()
    const body = mappingCreateSchema.parse(json)
    console.log(user)
    console.log(body)
    body?.virProjectIDs?.forEach((virProjectID )=> {
      console.log(virProjectID )
      const map = upsertMapping(virProjectID, body.feAccountID, user.id)
    })
    

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
