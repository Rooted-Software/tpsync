import { db } from '@/lib/db'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { buffer } from "micro";

export async function POST(req: Request) {
  const SECRET_KEY=process.env.ANEDOT_WEBHOOK_SECRET || ''
  const reqBuffer = req.body
  console.log('in webhook req post')
  const signature = headers().get('X-Request-Signature') as string
 
  //attempt whole body...not just text as above
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(reqBuffer);
  const hmacDigest = hmac.digest('hex');
  console.log(hmacDigest)
  console.log(signature)
  

  
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
  console.log(body)
  
  try {
    console.log('in webhook')
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  

  return new Response(null, { status: 200 })
}