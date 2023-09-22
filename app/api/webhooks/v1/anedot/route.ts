import { db } from '@/lib/db'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { buffer } from "micro";
import getRawBody from 'raw-body'
import { get, request } from 'http';
import { getAnedotGiftToVirtuousQuery } from '@/lib/anedot'
import { any } from 'prop-types';
import { match } from 'assert';
import { updateAnedotEvent } from '@/lib/anedot';



export async function POST(req) {
  const SECRET_KEY=process.env.ANEDOT_WEBHOOK_SECRET || ''
  const json = await req.json()
  console.log('in webhook req post')
  console.log(json)
  console.log(process.env.NEXTAUTH_URL)
  const signature = headers().get('X-Request-Signature') as string
  //attempt whole body...not just text as above
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  // hmac.update(body);
  // const hmacDigest = hmac.digest('hex');
  // console.log(hmacDigest)
  // console.log(signature)
  if (json.event) {
  const anEvent = await db.anedotEvent.create({
    data: {
      event: json.event,
      payload: json.payload,
      env: process.env.NEXTAUTH_URL || 'local',
    },
  })
  const queryObj = await getAnedotGiftToVirtuousQuery(json) 
  const query = queryObj.query || ''
  const meta= queryObj.meta || ''
  const updated=await updateAnedotEvent(anEvent.id, false, 'created', meta, query)
  console.log('event created')



}
  try {
    console.log('in webhook')
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  

  return new Response(null, { status: 200 })
}

export async function GET(req: Request) {
  const SC=process.env.ANEDOT_WEBHOOK_SECRET
  console.log('in webhook req')


  //verify webhook signature - wip
  const signature = headers().get('X-Request-Signature') as string
  console.log(SC)
  console.log(signature)
  const body = await req.text()

// sample payload 
const json = {payload :
{ "date": "2023-03-20 19:22:46 -0600", 
  "name": "Marshal Morse", 
  "email": "marshal@rooted.software", 
  "phone": "7859258099", 
  "title": "",
   "origin": "hosted", 
   "source": "credit_card", 
   "status": "completed", 
   "suffix": "", 
   "donation": 
        {"id": "d3269849e2a3643c7571c", 
        "fees": {"anedot_fees": {"amount": "1.03"}, "vendor_fees": []}, 
        "fund": {"id": "eede7ac9-9ea1-4d69-b8ef-324fea912ed6", "name": "General Fund", "identifier": "General Fund"}, 
        "products": [], 
        "card_type": "visa", 
        "card_last_digits": "5679", 
        "donation_project": "", 
        "credit_card_expiration": "12/2026"}, 

    "referrer": "https://secure.anedot.com/turning-point-usa/ce3bbd04-9b5d-4e5c-be0a-68a606c8d164?source_code=CONI236955&leadcreated=false", 
    "frequency": "monthly", 
    "last_name": "Morse", 
    "recurring": "false", 
    "created_at": "2023-03-20 19:22:46 -0600", 
    "first_name": "Marshal", 
    "ip_address": "2600:1700:290:44d0:f12c:a9a2:1ed1:1944", 
    "net_amount": "23.97", 
    "occupation": "", 
    "updated_at": "2023-03-20 19:22:46 -0600", 
    "account_uid": "a65655106ea9c404245e7", 
    "middle_name": "", 
    "source_code": "CONI236955", 
    "account_name": "TURNING POINT USA", 
    "address_city": "Ozawkie", 
    "check_number": "", 
    "date_iso8601": "2023-03-20T19:22:46-06:00", 
    "event_amount": "25.00", 
    "organization": "", 
    "employer_name": "", 
    "submission_id": "00352841-dc19-43ed-8158-97c896395c1b", 
    "action_page_id": "00331e69-0ce0-477d-8272-d291e056510c", 
    "address_line_1": "6257 Westlake Rd", "address_line_2": "", "address_region": "KS", 
    "commitment_uid": "12345", "address_country": "US", 
    "action_page_name": "TPUSA Mar 2023 CO", 
    "commitment_index": "4", 
    "donor_profile_id": "", 
    "referrer_to_form": "", 
    "amount_in_dollars": "25.0", 
    "payment_method_id": "4fedaa79-24c3-4664-888a-c6a0d0bb0170", 
    "created_at_iso8601": "2023-03-20T19:22:46-06:00", 
    "currently_employed": "true", 
    "updated_at_iso8601": "2023-03-20T19:22:46-06:00", 
    "address_postal_code": "66070-4187", 
    "payment_description": "Visa •••• 5679", 
    "custom_field_responses": {"campaign_source": "DE0923OT",  "promotion_item": "Founding Documents Bundle", "segment_name": "Summer 2023 Gateway donation processing", "tee_shirt_size": "XL"}, 
    "is_recurring_commitment": "false", 
    "commitment_recurring_until": "", 
    "communications_consent_email": "false", 
    "communications_consent_phone": "false",
    "comments" : "This is a test comment", 
    "in_honor_of" : "My Mother"
    
  }
}
// set date constants
 const queryObj = await getAnedotGiftToVirtuousQuery(json) 
const query = queryObj.query || ''
  try {
    
    const res = await fetch('https://api.virtuoussoftware.com/api/v2/Gift/Transaction', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: query ,
    })
  
    const transData = await res.text()
    console.log('in webhook')
    console.log(transData)
   
  } catch (error) {
    console.log(error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  

  return new Response(null, { status: 200 })
}