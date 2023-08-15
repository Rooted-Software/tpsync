import { db } from '@/lib/db'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { buffer } from "micro";
import getRawBody from 'raw-body'
import { request } from 'http';

export async function POST(req) {
  const SECRET_KEY=process.env.ANEDOT_WEBHOOK_SECRET || ''
  const body = await req.getBuffer()
  console.log('in webhook req post')
  const signature = headers().get('X-Request-Signature') as string
  //attempt whole body...not just text as above
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(body);
  const hmacDigest = hmac.digest('hex');
  console.log(hmacDigest)
  console.log(signature)
  
  if (hmacDigest === signature) {
    console.log("Success! This request came from Anedot.")
    
  }else { 
    return new Response(`Webhook Error: Key did not match`, { status: 400 })
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
  console.log(body)
  
  try {
    console.log('in webhook')
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
  

  return new Response(null, { status: 200 })
}