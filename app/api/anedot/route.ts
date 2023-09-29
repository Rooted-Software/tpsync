import {
  getAnedotEvents,
  getAnedotGiftToVirtuousQuery,
  updateAnedotEvent,
} from "@/lib/anedot"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"
import * as z from "zod"

const eventCreateSchema = z.object({
  id: z.string(),
  test: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  console.log("in get events")
  try {
    console.log("in get events try")
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    const { user } = session
    console.log("getting params")
    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0") || 0

    const take = 25
    console.log("getting events...")
    const anEvents = await getAnedotEvents(user.teamId, skip, take)

    return new Response(JSON.stringify(anEvents))
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  console.log("in anedot post route")
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }
    const json = await req.json()
    const body = eventCreateSchema.parse(json)
    const event = await db.anedotEvent.findFirst({
      where: {
        id: body.id,
      },
    })
    if (event) {
      console.log(event.payload)
      const queryObj = await getAnedotGiftToVirtuousQuery(event)
      const query = queryObj.query
      if (!body.test) {
        console.log(" not testing *****  - Posting to virtuous")
        try {
          const res = await fetch(
            "https://api.virtuoussoftware.com/api/v2/Gift/Transaction",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: query,
            }
          )
          const transData = await res.text()
          console.log("in webhook")
          console.log(transData)

          if (res.status === 200) {
            updateAnedotEvent(
              event.id,
              true,
              "success",
              queryObj.meta,
              queryObj.query
            )
          } else {
            queryObj.meta.attentionString += "virtuous error: " + transData
            updateAnedotEvent(
              event.id,
              false,
              "failure",
              queryObj.meta,
              queryObj.query
            )
          }

          //log transaction
        } catch (error) {
          console.log(error)
          return new Response(`Webhook Error: ${error.message}`, {
            status: 400,
          })
        }
      } else {
        updateAnedotEvent(
          event.id,
          false,
          "tested",
          queryObj.meta,
          queryObj.query
        )
        return new Response(JSON.stringify(queryObj.toString()), {
          status: 200,
        })
      }
    } else {
      return new Response("event not found", { status: 404 })
    }
  } catch (error) {
    console.log(error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
