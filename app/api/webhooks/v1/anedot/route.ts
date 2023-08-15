import { db } from '@/lib/db'
import { headers } from 'next/headers'


export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: Request) {
  console.log('in webhook req')
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
