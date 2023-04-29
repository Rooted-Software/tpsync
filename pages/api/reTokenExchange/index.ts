import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import * as z from 'zod'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('first request')
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(403).end()
  }

  const { user } = session
  console.log('api call test')
  console.log(user)

  if (req.method === 'POST') {
    try {
      console.log('api call test - post')
      const session = await unstable_getServerSession(req, res, authOptions)
      console.log(req.body)
      if (!session) {
        return res.status(403).end()
      }

      const authStuff = `Basic ${Buffer.from(
        process.env.AUTH_CLIENT_ID + ':' + process.env.AUTH_CLIENT_SECRET
      ).toString('base64')}`
      const bodyStuff = `grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%2Fsettings%2FreCallBack&code=${req.body.code}`
      console.log(authStuff)
      console.log(bodyStuff)
      const res2 = await fetch('https://oauth2.sky.blackbaud.com/token', {
        method: 'POST',
        headers: {
          Authorization: authStuff,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyStuff,
      })
      console.log('after auth')
      console.log(res2.status)
      console.log(res2)
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(405).end()
      }
      const data = await res2.json()
      console.log(data)
      if (user) {
        // save some data
        const reSettings = await db.reSettings.findFirst({
          where: {
            userId: user.id,
          },
        })
        let reSettingsData: Prisma.reSettingsUncheckedCreateInput = {
          userId: user.id,
          token_type: data.token_type,
          expires_in: data.expires_in,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          environment_id: data.environment_id,
          environment_name: data.environment_name,
          legal_entity_id: data.legal_entity_id,
          legal_entity_name: data.legal_entity_name,
          user_id: data.user_id,
          email: data.email,
          family_name: data.family_name,
          given_name: data.given_name,
          refresh_token_expires_in: data.refresh_token_expires_in,
          mode: data.mode,
          scope: data.scope,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        if (!reSettings) {
          console.log('no reSettings found')
          // create new reSettings

          console.log('')
          const newAccount = await db.reSettings.create({
            data: reSettingsData,
            select: {
              id: true,
            },
          })
        } else {
          console.log('updating reSettings')
          // update account (with tokens)
          console.log(reSettings.id)
          const updatedAccount = await db.reSettings.update({
            where: {
              id: reSettings.id,
            },
            data: reSettingsData,
          })
        }
      } else {
        //no user found
        return res.status(403).end()
      }
      console.log('returning reSettings data')
      return res.status(200).json({ message: 'RE Settings Updated' })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues)
      }

      return res.status(500).end()
    }
  }
}

export default withMethods(['GET', 'POST'], handler)
