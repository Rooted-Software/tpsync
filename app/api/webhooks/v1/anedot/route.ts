import { headers } from "next/headers";

import { getAnedotGiftToVirtuousQuery } from "@/lib/anedot";
import { updateAnedotEvent } from "@/lib/anedot";
import { db } from "@/lib/db";
import { match } from "assert";
import crypto, { sign } from "crypto";
import { get, request } from "http";
import { buffer } from "micro";
import test from "node:test";
import { any } from "prop-types";


export const maxDuration = 300

export async function POST(req) {
  const SECRET_KEY = process.env.ANEDOT_WEBHOOK_SECRET || ""

  const bodyText = await req.text()
  console.log(bodyText)
  const json = JSON.parse(bodyText)
  console.log("in webhook req post")
  const searchParams = req.nextUrl.searchParams
  var tpSourceName = searchParams.get('source') || null
  if (tpSourceName === "FaithTest") {
    tpSourceName = "TPUSA"

  }

  const signature = headers().get("X-Request-Signature") as string
  const webhookId = headers().get("X-Request-Id") as string
  const integrationId = headers().get("X-Integration-Id") as string
  const account_uid = json.payload?.account_uid
  var ws: any = null 
  if (account_uid) { 
    ws = await db.anedotWebhook.findFirst({
      where: {
        account_uid: account_uid,
      },
    }) 
      console.log('got by account_uid')
  } else if (!account_uid && tpSourceName) { 
      ws  = await db.anedotWebhook.findFirst({
      where: {
        account_name: tpSourceName,
      },
    }) 
    console.log('got by source name: ' + tpSourceName)
    
    console.log('new payload: ') 
    console.log(json.payload)
  } 

 
  // Signatures are provided for each webhook request to verify the authenticity of the request. Verify the signature by producing a SHA-256 HMAC hexdigest using the webhook's secret token as the private key and the webhook body represented as a JSON string.
  // The hexdigest you calculate should match the value in our "X-Request-Signature" header for that webhook request.
  let hash = ""
  if (ws?.webhook_secret) {
    hash = crypto
      .createHmac("sha256", ws?.webhook_secret)
      .update(bodyText)
      .digest("hex")

    console.log(hash, signature)
    console.log(hash === signature)
  }
  //we can't do this until after checking the 
  console.log("uid....")
  console.log(ws?.account_uid)
  json.payload.account_uid = ws?.account_uid
  if (json.event && hash === signature) {
     console.log("in webhook")
    // if the payload does not have a source id - add it to our fallback. 
   
    const anEvent = await db.anedotEvent.create({
      data: {
        webhookId: webhookId,
        integrationId: integrationId,
        signature: signature,
        event: json.event,
        payload: json.payload,
        env: process.env.NEXTAUTH_URL || "local",
      },
    })
    const queryObj = await getAnedotGiftToVirtuousQuery(json, false)
    const query = queryObj.query || ""
    const meta = queryObj.meta || ""
    const updated = await updateAnedotEvent(
      anEvent.id,
      false,
      "created",
      meta,
      query
    )
    console.log("event created -- syncing to virtuous")
    // go ahead and sync....
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
        const updated = await updateAnedotEvent(
          anEvent.id,
          true,
          "synced",
          meta,
          query
        )
      } else {
        let attnString = JSON.parse(meta.attentionString) || []
        let resBody = JSON.parse(transData) || ["unable to parse respBody"]
        attnString.push(resBody?.message)
        let modelState = resBody?.modelState
        if (modelState) {
          for (const [key, value] of Object.entries(modelState)) {
            if (Array.isArray(Object[key])) {
              // push each item in array to attnString
              modelState[key].forEach((item) => {
                attnString.push(`${key}: ${item}`)
              })
            }
            attnString.push(`${key}: ${value}`)
          }
        }
        meta.attentionString = JSON.stringify(attnString)
        meta.syncSrc = "webhook"
        // we should look at the response and see if this was a rejection due to a duplicate gift, and if so, we should log it as duplicate and not error

        let status = "error"
        if (transData.includes("Gift Transaction already exists.")) {
          status = "duplicate"
        }
        meta.syncErrorResponse = resBody
        const updated = await updateAnedotEvent(
          anEvent.id,
          status === "duplicate" ? true : false,
          status,
          meta,
          query
        )
      }
    } catch (error) {
      console.log(error)
      return new Response(`Webhook Error: ${error.message}`, { status: 400 })
    }

    console.log("event created")
  } else {
    console.log("webhook signature did not match - event not created")
    return new Response(
      `Webhook Signature Error: webhook signnature didn't match`,
      {
        status: 400,
      }
    )
  }
  try {
    console.log("in webhook")
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  return new Response(null, { status: 200 })
}

export async function GET(req: Request) {
  // for testing purposes only
  console.log("in webhook req")

  //verify webhook signature - wip sample signature:
  const signature =
    "7594f9ca067122b1617aafacde7f537c1fde381055c26f97e676f5d1d6d30358"
  const testjson = `{
    event: "donation_completed",
    payload: {
      date: "2023-09-29 18:41:09 UTC",
      name: "Richard Kersten",
      email: "radicaldestin2@gmail.com",
      phone: "8505853302",
      title: "",
      origin: "hosted",
      source: "credit_card",
      status: "completed",
      suffix: "",
      donation: {
        id: "d8fb6b0d7d2d92e8a4a52",
        fees: {
          anedot_fees: {
            amount: "1.03",
          },
          vendor_fees: [],
        },
        fund: {
          id: "eede7ac9-9ea1-4d69-b8ef-324fea912ed6",
          name: "General Fund",
          identifier: "General Fund",
        },
        products: [],
        card_type: "master",
        card_last_digits: "8041",
        donation_project: "",
        credit_card_expiration: "12/2025",
      },
      referrer:
        "https://secure.anedot.com/turning-point-usa/11a8efc6-e33f-4f8d-b4e4-31843ae47664?source_code=TPUSA11506&express_checkout_method=applepay",
      utm_term: "",
      frequency: "once",
      last_name: "Kersten",
      recurring: "false",
      created_at: "2023-09-29 18:41:09 UTC",
      first_name: "Richard",
      ip_address: "2600:8807:9208:d500:5ccf:26de:aae4:7756",
      net_amount: "23.97",
      occupation: "",
      updated_at: "2023-09-29 18:41:09 UTC",
      utm_medium: "",
      utm_source: "",
      account_uid: "a65655106ea9c404245e7",
      middle_name: "",
      source_code: "TPUSA11506",
      utm_content: "",
      account_name: "TURNING POINT USA",
      address_city: "Niceville",
      check_number: "",
      date_iso8601: "2023-09-29T18:41:09Z",
      event_amount: "25.00",
      organization: "",
      utm_campaign: "",
      employer_name: "",
      submission_id: "daea75fd-4461-49be-906e-0645036b4e62",
      action_page_id: "16f6862f-8ad9-4c53-bdb2-c315a6367a0c",
      address_line_1: "129 Baywind Dr.",
      address_line_2: "",
      address_region: "FL",
      commitment_uid: "",
      address_country: "US",
      action_page_name: "TPUSA Sept 2023 C3 - A",
      commitment_index: "",
      donor_profile_id: "",
      referrer_to_form: "",
      amount_in_dollars: "25.0",
      payment_method_id: "5c375f5d-7673-485c-8d40-4a1474bc5389",
      created_at_iso8601: "2023-09-29T18:41:09Z",
      currently_employed: "true",
      updated_at_iso8601: "2023-09-29T18:41:09Z",
      address_postal_code: "32578",
      payment_description: "MasterCard •••• 8041 (ApplePay)",
      custom_field_responses: {
        segment_name: "AE_HF_Sept2023_LiveFreeTour",
      },
      is_recurring_commitment: "false",
      commitment_recurring_until: "",
      communications_consent_email: "false",
      communications_consent_phone: "false",
    },
  }`
  console.log(testjson.replace(/\n/g, "").replace('/"', '"'))
  const jsonTest = JSON.parse(testjson.replace("/n", "").replace('/"', '"'))
  const ws = await db.anedotWebhook.findFirst({
    where: {
      account_uid: jsonTest.account_uid,
    },
  })

  if (ws?.webhook_secret) {
    const verify = crypto
      .createHmac("sha256", ws.webhook_secret)
      .update(testjson)
      .digest("hex")
    console.log(verify, signature)
  }
  const body = await req.text()

  // sample payload
  const json = {
    payload: {
      date: "2023-03-20 19:22:46 -0600",
      name: "Marshal Morse",
      email: "marshal@rooted.software",
      phone: "7859258099",
      title: "",
      origin: "hosted",
      source: "credit_card",
      status: "completed",
      suffix: "",
      donation: {
        id: "d3269849e2a3643c7571c",
        fees: { anedot_fees: { amount: "1.03" }, vendor_fees: [] },
        fund: {
          id: "eede7ac9-9ea1-4d69-b8ef-324fea912ed6",
          name: "General Fund",
          identifier: "General Fund",
        },
        products: [],
        card_type: "visa",
        card_last_digits: "5679",
        donation_project: "",
        credit_card_expiration: "12/2026",
      },

      referrer:
        "https://secure.anedot.com/turning-point-usa/ce3bbd04-9b5d-4e5c-be0a-68a606c8d164?source_code=CONI236955&leadcreated=false",
      frequency: "monthly",
      last_name: "Morse",
      recurring: "false",
      created_at: "2023-03-20 19:22:46 -0600",
      first_name: "Marshal",
      ip_address: "2600:1700:290:44d0:f12c:a9a2:1ed1:1944",
      net_amount: "23.97",
      occupation: "",
      updated_at: "2023-03-20 19:22:46 -0600",
      account_uid: "a65655106ea9c404245e7",
      middle_name: "",
      source_code: "CONI236955",
      account_name: "TURNING POINT USA",
      address_city: "Ozawkie",
      check_number: "",
      date_iso8601: "2023-03-20T19:22:46-06:00",
      event_amount: "25.00",
      organization: "",
      employer_name: "",
      submission_id: "00352841-dc19-43ed-8158-97c896395c1b",
      action_page_id: "00331e69-0ce0-477d-8272-d291e056510c",
      address_line_1: "6257 Westlake Rd",
      address_line_2: "",
      address_region: "KS",
      commitment_uid: "12345",
      address_country: "US",
      action_page_name: "TPUSA Mar 2023 CO",
      commitment_index: "4",
      donor_profile_id: "",
      referrer_to_form: "",
      amount_in_dollars: "25.0",
      payment_method_id: "4fedaa79-24c3-4664-888a-c6a0d0bb0170",
      created_at_iso8601: "2023-03-20T19:22:46-06:00",
      currently_employed: "true",
      updated_at_iso8601: "2023-03-20T19:22:46-06:00",
      address_postal_code: "66070-4187",
      payment_description: "Visa •••• 5679",
      custom_field_responses: {
        campaign_source: "DE0923OT",
        promotion_item: "Founding Documents Bundle",
        segment_name: "Summer 2023 Gateway donation processing",
        tee_shirt_size: "XL",
      },
      is_recurring_commitment: "false",
      commitment_recurring_until: "",
      communications_consent_email: "false",
      communications_consent_phone: "false",
      comments: "This is a test comment",
      in_honor_of: "My Mother",
    },
  }
  // set date constants
  const queryObj = await getAnedotGiftToVirtuousQuery(json)
  const query = queryObj.query || ""
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
  } catch (error) {
    console.log(error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  return new Response(null, { status: 200 })
}