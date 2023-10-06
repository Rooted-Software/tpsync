import {
  generateEventQuery,
  getAnedotEvents,
  getAnedotEventsCount,
  getAnedotGiftToVirtuousQuery,
  updateAnedotEvent,
} from "@/lib/anedot"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"
import * as z from "zod"

export const maxDuration = 300

const eventCreateSchema = z.object({
  id: z.string(),
  test: z.boolean().optional(),
})

const eventFilterSchema = z.object({
  event: z.string().optional(),
  donationId: z.string().optional(),
  webhookId: z.string().optional(),
  status: z.string().optional(),
  matchQuality: z.string().optional(),
  attention: z.string().optional(),
  fund: z.string().optional(),
  origin: z.string().optional(),
  segment: z.string().optional(),
  virtuousContact: z.string().optional(),
  synced: z.string().optional(),
  createdAt: z.string().optional(),
  orderField: z.string().optional(),
  orderDirection: z.string().optional(),
  page: z.number().optional(),
  test: z.boolean().optional(),
})

const allowSort = ["created_at", "matchQuality"]
const allowFilter = [
  "event",
  "src",
  "env",
  "recurringGiftId",
  "recurringGiftMatch",
  "updateRecurring",
  "synced",
  "status",
  "projectMatch",
  "contactMatch",
  "segmentMatch",
  "addressMatch",
  "matchQuality",
  "virtuousContact",
  "virtuousProject",
  "virtuousSegment",
  "attention",
  "createdAt",
]

function slashEscape(contents) {
  return contents
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
}

var replacements = { "\\\\": "\\", "\\n": "\n", '\\"': '"' }

function slashUnescape(contents) {
  return contents.replace(/\\(\\|n|")/g, function (replace) {
    return replacements[replace]
  })
}

export async function GET(request: NextRequest) {
  console.log("in get events")
  try {
    console.log("in get events try")
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }
    const allowOrderFields = ["created_at", "matchQuality"]
    const allowFilterFields = [
      "event",
      "createdAt",
      "synced",
      "matchQuality",
      "status",
      "id",
    ]
    const { user } = session
    console.log("getting params")
    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0") || 0
    const orderField =
      request.nextUrl.searchParams.get("orderField") || "created_at"
    const orderDirection =
      request.nextUrl.searchParams.get("orderDirection") || "desc"

    let orderBy: Record<string, string> = {}
    orderBy[orderField] = orderDirection

    // for each of the allowed fields, construct an object for the prisma where clause
    const filterObj = {}
    for (const key of allowFilterFields) {
      const value = request.nextUrl.searchParams.get(key)
      if (value) {
        filterObj[key] = value
      }
    }

    const take = 25
    console.log("getting events...")
    const anEvents = await getAnedotEvents(
      user.teamId,
      skip,
      take,
      filterObj,
      orderBy
    )

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
    const body = eventFilterSchema.parse(json)

    const { filterObj, orderBy, page } = generateEventQuery(body)
    const eventCount = await getAnedotEventsCount(
      session.user.teamId,
      filterObj,
      orderBy
    )
    console.log("Event Count", eventCount)
    const anEvents = await getAnedotEvents(
      session.user.teamId,
      0,
      eventCount,
      filterObj,
      orderBy
    )
    let transactionsString = ""
    let transactionObject: any[] = []
    let attentionString = ""
    let attentionObject: any[] = []

    if (anEvents) {
      let eventIndex = 0
      for (const event of anEvents) {
        eventIndex++

        let query = slashUnescape(event.virtuousQuery)
        let meta = {
          recurringGiftId: event.recurringGiftId,
          recurringGiftMatch: event.recurringGiftMatch,
          projectMatch: event.projectMatch,
          segmentMatch: event.segmentMatch,
          nameMatch: event.contactMatch,
          addressMatch: event.addressMatch,
          updateRecurring: event.updateRecurring,
          attentionString: event.attentionReason,
          projectId: event.virtuousProject,
          segmentId: event.virtuousSegment,
          contactId: event.virtuousContact,
          matchQuality: event.matchQuality,
        }
        let queryObj = { query: query, meta: meta }
        console.log("in loop")
        if (
          !(
            event.virtuousQuery &&
            event.virtuousQuery?.length > 1 &&
            !body.test
          )
        ) {
          queryObj = await getAnedotGiftToVirtuousQuery(event, body.test)
          query = slashUnescape(queryObj.query)
        }
        if (
          queryObj &&
          queryObj.meta &&
          queryObj.meta.matchQuality &&
          (queryObj.meta.matchQuality < 4 ||
            !queryObj?.meta?.projectId ||
            !queryObj?.meta?.contactId ||
            !queryObj?.meta?.segmentId)
        ) {
          attentionObject.push({
            event: event.id,
            queryObj: queryObj,
            query: query,
          })
          attentionString =
            attentionString.length > 0
              ? attentionString + "," + query
              : attentionString + query
        } else {
          transactionsString =
            transactionsString.length > 0
              ? transactionsString + "," + query
              : transactionsString + query
          transactionObject.push({ event: event.id, queryObj: queryObj })
        }
      }
      // outside loop - now post to transaction endpoint
      if (!body.test) {
        console.log("*******   not testing *****  - Posting to virtuous")
        const today = new Date()
        const giftDate = new Date()
        const giftShortDate =
          giftDate.getMonth() +
          1 +
          "." +
          giftDate.getDate() +
          "." +
          giftDate.getFullYear()
        const bigQuery = `{
              "transactionSource": "TPSync",
              "transactions": [
                  ${transactionsString}
              ],
              "createImport": "true",
              "importName": "TPUSA Bulk",
              "batch": "Test Batch",
              "defaultGiftDate": "${giftShortDate}",
              "defaultGiftType": "Credit"
          }`
        const attentionQuery = `{
              "transactionSource": "TPSync",
              "transactions": [
                  ${attentionString}
              ],
              "createImport": "true",
              "importName": "TPUSA Bulk - attention",
              "batch": "Test Batch - Attention",
              "defaultGiftDate": "${giftShortDate}",
              "defaultGiftType": "Credit"
          }`
        console.log("big query")
        console.log(bigQuery)
        // individual gift post
        try {
          const res = await fetch(
            "https://api.virtuoussoftware.com/api/v2/Gift/Transactions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: bigQuery,
            }
          )
          const transData = await res.text()
          console.log("in bulk post ")
          console.log(transData)

          const res2 = await fetch(
            "https://api.virtuoussoftware.com/api/v2/Gift/Transactions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: attentionQuery,
            }
          )
          const trans2Data = await res2.text()
          console.log("in bulk post - attention ")
          console.log(trans2Data)

          if (res.status === 200) {
            console.log("success - bulk success")
            console.log(transactionObject)
            for (const event of transactionObject) {
              console.log("in update event loop")
              console.log(event)
              updateAnedotEvent(
                event.event,
                true,
                "success",
                event.queryObj.meta,
                event.queryObj.query
              )
            }
            if (res2.status === 200) {
              for (const event of attentionObject) {
                console.log("in update event loop")
                console.log(event)
                updateAnedotEvent(
                  event.event,
                  true,
                  "success",
                  event.queryObj.meta,
                  event.queryObj.query
                )
              }
            }

            return new Response(JSON.stringify("bulk success"), {
              status: 200,
            })
          } else {
            console.log("not success")
            /* 
              queryObj.meta.attentionString += "virtuous error: " + transData
              updateAnedotEvent(
                event.id,
                false,
                "failure",
                queryObj.meta,
                queryObj.query
              ) */
          }

          //log transaction
        } catch (error) {
          console.log(error)
          return new Response(`Webhook Error: ${error.message}`, {
            status: 400,
          })
        }
      } else {
        console.log("it was only a test: success")
        for (const event of transactionObject) {
          console.log("in update event loop")
          console.log(event)
          updateAnedotEvent(
            event.event,
            false,
            "tested",
            event.queryObj.meta,
            event.queryObj.query
          )
        }
      }

      // should have all bundles

      return new Response(JSON.stringify("synced"), {
        status: 200,
      })
    } else {
      console.log(" error in bundling ")
      return new Response("event not found", { status: 404 })
    }
  } catch (error) {
    console.log("in error ---- wierd")

    console.log(error)

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

export async function PATCH(req: Request) {
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
      const queryObj = await getAnedotGiftToVirtuousQuery(event, false)
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
            console.log("success")
            updateAnedotEvent(
              event.id,
              true,
              "success",
              queryObj.meta,
              queryObj.query
            )
            return new Response(JSON.stringify(queryObj.toString()), {
              status: 200,
            })
          } else {
            console.log("not success")
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
        console.log("it was only a test: success")
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
    console.log("in error ---- wierd")

    console.log(error)

    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
