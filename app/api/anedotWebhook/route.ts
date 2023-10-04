import {
  getAnedotEvents,
  getAnedotGiftToVirtuousQuery,
  updateAnedotEvent,
} from "@/lib/anedot"
import { getAnedotWebhooks } from "@/lib/anedotWebhook"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"
import * as z from "zod"

const webhookCreateSchema = z.object({
  account_uid: z.string(),
  account_name: z.string(),
  webhook_secret: z.string(),
  active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  console.log("in get anedot webhoooks")
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    const { user } = session
    console.log("getting params")

    const anWebhooks = await getAnedotWebhooks(user.teamId)

    return new Response(JSON.stringify(anWebhooks))
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  console.log("in anedot webhook post route")
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }
    const json = await req.json()
    const body = webhookCreateSchema.parse(json)
    // create a new webhook
    console.log("creating new webhook")
    const newWebhook = await db.anedotWebhook.create({
      data: {
        account_uid: body.account_uid,
        account_name: body.account_name,
        webhook_secret: body.webhook_secret,
        active: body.active,
        teamId: session.user.teamId,
      },
    })
    console.log("created new webhook")
    return new Response(JSON.stringify(newWebhook), { status: 201 })
  } catch (error) {
    console.log(error)

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
