import { db } from '@/lib/db'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { buffer } from "micro";
import getRawBody from 'raw-body'
import { request } from 'http';

async function getVirtuousContact(email) 
    {
        const res = await fetch('https://api.virtuoussoftware.com/api/Contact/Find?email='+email, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
                'Content-Type': 'application/json',
            },})
            const data=await res.json()
        return data
     }

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
  await db.anedotEvent.create({
    data: {
      event: json.event,
      payload: json.payload,
      env: process.env.NEXTAUTH_URL || 'local',
    },
  })
  console.log('event created')
  if (json.event === 'donation_complete') {
    db.anedotDonation.create({
      data: json.payload,
     })


     console.log('donation created')
  }
  

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
  console.log(SC)
  const signature = headers().get('X-Request-Signature') as string
  console.log(signature)
  const body = await req.text()


const json = {payload :
{ "date": "2023-03-20 19:22:46 -0600", 
  "name": "John Kinzell", 
  "email": "jkinzell@comcast.net", 
  "phone": "4152508763", 
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
        "frequency": "once", 
        "last_name": "Kinzell", 
        "recurring": "false", 
        "created_at": "2023-03-20 19:22:46 -0600", 
        "first_name": "John", 
        "ip_address": "2600:1700:290:44d0:f12c:a9a2:1ed1:1944", 
        "net_amount": "23.97", 
        "occupation": "", 
        "updated_at": "2023-03-20 19:22:46 -0600", 
        "account_uid": "a65655106ea9c404245e7", 
        "middle_name": "", 
        "source_code": "CONI236955", 
        "account_name": "TURNING POINT USA", 
        "address_city": "Austin", 
        "check_number": "", 
        "date_iso8601": "2023-03-20T19:22:46-06:00", 
        "event_amount": "25.00", 
        "organization": "", 
        "employer_name": "", 
        "submission_id": "00352841-dc19-43ed-8158-97c896395c1b", 
        "action_page_id": "00331e69-0ce0-477d-8272-d291e056510c", 
        "address_line_1": "3303 Windsor Road", "address_line_2": "", "address_region": "TX", 
        "commitment_uid": "", "address_country": "US", 
        "action_page_name": "TPUSA Mar 2023 CO", 
        "commitment_index": "", 
        "donor_profile_id": "", 
        "referrer_to_form": "", 
        "amount_in_dollars": "25.0", 
        "payment_method_id": "4fedaa79-24c3-4664-888a-c6a0d0bb0170", 
        "created_at_iso8601": "2023-03-20T19:22:46-06:00", 
        "currently_employed": "true", 
        "updated_at_iso8601": "2023-03-20T19:22:46-06:00", 
        "address_postal_code": "78703", 
        "payment_description": "Visa •••• 5679", 
        "custom_field_responses": {"campaign_source": "AE_HF_Mar2023_LiveFreeTour"}, 
        "is_recurring_commitment": "false", 
        "commitment_recurring_until": "", 
        "communications_consent_email": "false", 
        "communications_consent_phone": "false"}
}
 
const today =  new Date()
const shortDate = (today.getMonth()+1)+'.'+today.getDate()+'.'+today.getFullYear();
const giftDate = new Date(json.payload.date)
const contact = await getVirtuousContact('marshal@rooted.software')
console.log('Getting Contact')

// if no contact... either create or fail
if (!contact?.id) { 
  console.log('no contact')

}
console.log(contact.id)

const giftShortDate = (giftDate.getMonth()+1)+'.'+giftDate.getDate()+'.'+giftDate.getFullYear();
  const query = `
  {
    "contactId": "${contact.id}",
    "giftType": "Cash",
    "giftDate": "<dateTime>",
    "amount": "<double>",
    "transactionSource": "<string>",
    "transactionId": "<string>",
    "batch": "<string>",
    "segmentId": "<integer>",
    "receiptSegmentId": "<integer>",
    "mediaOutletId": "<integer>",
    "notes": "<string>",
    "isPrivate": "<boolean>",
    "receiptDate": "<dateTime>",
    "contactIndividualId": "<integer>",
    "contactPassthroughId": "<integer>",
    "cashAccountingCode": "<string>",
    "state": "<string>",
    "isTaxDeductible": "<boolean>",
    "giftAskId": "<integer>",
    "passthroughGiftAskId": "<integer>",
    "grantId": "<integer>",
    "contactMembershipId": "<integer>",
    "currencyCode": "<string>",
    "exchangeRate": "<decimal>",
    "checkNumber": "<string>",
    "creditCardType": "<string>",
    "cryptocoinType": "<string>",
    "transactionHash": "<string>",
    "coinSoldForCash": "<boolean>",
    "coinAmount": "<double>",
    "dateCoinWasSold": "<dateTime>",
    "coinSaleAmount": "<double>",
    "tickerSymbol": "<string>",
    "numberOfShares": "<double>",
    "iraCustodian": "<string>",
    "stockSoldForCash": "<boolean>",
    "dateStockWasSold": "<dateTime>",
    "stockSaleAmount": "<double>",
    "nonCashGiftTypeId": "<integer>",
    "nonCashGiftType": "<string>",
    "description": "<string>",
    "nonCashSoldForCash": "<boolean>",
    "dateNonCashWasSold": "<dateTime>",
    "nonCashOriginalAmount": "<double>",
    "nonCashSaleAmount": "<double>",
    "giftDesignations": [
        {
            "projectId": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        },
        {
            "projectId": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        }
    ],
    "giftPremiums": [
        {
            "premiumId": "<integer>",
            "quantity": "<integer>",
            "state": "<string>"
        },
        {
            "premiumId": "<integer>",
            "quantity": "<integer>",
            "state": "<string>"
        }
    ],
    "pledgePayments": [
        {
            "id": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        },
        {
            "id": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        }
    ],
    "recurringGiftPayments": [
        {
            "id": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        },
        {
            "id": "<integer>",
            "amount": "<double>",
            "state": "<string>"
        }
    ],
    "tributeType": "<string>",
    "tributeId": "<integer>",
    "tributeDescription": "<string>",
    "acknowledgeeId": "<integer>",
    "reversedGiftId": "<integer>",
    "customFields": [
        {
            "name": "<string>",
            "value": "<string>",
            "displayName": "<string>"
        },
        {
            "name": "<string>",
            "value": "<string>",
            "displayName": "<string>"
        }
    ]
}
  `;

  //console.log(query)
  try {
      /*
    const res = await fetch('https://api.virtuoussoftware.com/api/v2/Gift/Transaction', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.VIRTUOUS_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: query ,
    })
    console.log(res)
    const text = res.body
    const stuff = await res.text() 
    console.log(stuff)




    */
 
    console.log('in webhook')
  } catch (error) {
    console.log(error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  

  return new Response(null, { status: 200 })
}


