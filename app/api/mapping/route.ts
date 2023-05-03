import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { postPatchSchema } from '@/lib/validations/post'
import { getServerSession } from 'next-auth'
import * as z from 'zod'

const mappingCreateSchema = z.object({
    virProjectID: z.string().optional(),
    feProjectID: z.string().optional(),
  })

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
    const posts = await db.post.findMany({
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
        },
        where: {
          authorId: user.id,
        },
      })

      return new Response(JSON.stringify(posts), { status: 422 })
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
    const body = mappingCreateSchema.parse(json)

    const mapping = await db.projectMapping.create({
      data: {
        virProjectId: body.virProjectID || '',
        feProjectId: body.feProjectID || '',
      },
      select: {
        id: true,
      },
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

async function verifyCurrentUserHasAccessToPost(postId: string) {
  const session = await getServerSession(authOptions)
  const count = await db.post.count({
    where: {
      id: postId,
      authorId: session?.user.id,
    },
  })

  return count > 0
}

