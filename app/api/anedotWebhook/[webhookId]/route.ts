import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { postPatchSchema } from "@/lib/validations/post"
import { getServerSession } from "next-auth"
import * as z from "zod"

const routeContextSchema = z.object({
  params: z.object({
    webhookId: z.string(),
  }),
})

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  console.log("in delete anedot webhoooks")
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context)
    const session = await getServerSession(authOptions)
    // Check if the user has access to this post.
    if (!(await verifyCurrentUserHasAccessToWebhook(params.webhookId))) {
      return new Response(null, { status: 403 })
    }
    console.log("we an delete")
    // Delete the post.
    await db.anedotWebhook.delete({
      where: {
        id: params.webhookId as string,
        teamId: session?.user?.teamId,
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  console.log("in patch api webhook route")
  const allowedKeys = ["active"]

  try {
    // Validate route params.
    const { params } = routeContextSchema.parse(context)
    const session = await getServerSession(authOptions)
    console.log("session", session)
    if (!session) {
      return new Response(null, { status: 403 })
    }
    // Check if the user has access to this post.

    const { user } = session
    const data = await req.json()
    console.log("data", data)
    console.log("params", params)
    if (Object.keys(data).every((key) => allowedKeys.includes(key))) {
      await db.anedotWebhook.update({
        where: {
          id: params.webhookId,
          teamId: user.team.id,
        },
        data,
        select: {
          id: true,
        },
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

async function verifyCurrentUserHasAccessToWebhook(webhookId: string) {
  const session = await getServerSession(authOptions)
  console.log("session", session)
  const count = await db.anedotWebhook.count({
    where: {
      id: webhookId,
      teamId: session?.user?.team?.id,
    },
  })
  console.log("count", count)
  return count > 0
}
