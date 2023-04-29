import { RESettingsForm } from '@/components/dashboard/re-settings'
import { VirtuousSettingsForm } from '@/components/dashboard/virtuous-settings'
import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'
import { UserNameForm } from '@/components/user-name-form'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'

const { AuthorizationCode } = require('simple-oauth2')

const reSettingsForUser = cache(async (userId: User['id']) => {
  return await db.reSettings.findFirst({
    select: {
      id: true,
      environment_name: true,
      legal_entity_id: true,
      email: true,
      expires_in: true,
    },
    where: {
      userId: userId,
    },
  })
})

const config = {
  client: {
    id: process.env.AUTH_CLIENT_ID,
    secret: process.env.AUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://app.blackbaud.com/oauth/authorize',
  },
}
var crypto
crypto = require('crypto')
const client = new AuthorizationCode(config)
const stateID = crypto.randomBytes(48).toString('hex')
const reAuthorizeURL = client.authorizeURL({
  redirect_uri: process.env.AUTH_REDIRECT_URI,
  state: stateID,
})
console.log('here goes')
console.log(reAuthorizeURL)
const getApiKey = cache(async (userId: User['id']) => {
  return await db.apiSettings.findFirst({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      virtuousAPI: true,
    },
  })
})

export const metadata = {
  title: 'Settings',
  description: 'Manage account and website settings.',
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const apiKey = await getApiKey(user.id)
  const data = await reSettingsForUser(user.id)
  console.log(data)
  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name || '' }} />
      </div>
      <div className="grid gap-10">
        <VirtuousSettingsForm
          user={{ id: user.id, name: user.name }}
          apiKey={apiKey?.virtuousAPI}
        />
      </div>
      <div className="grid gap-10">
        <RESettingsForm
          user={{ id: user.id, name: user.name }}
          reAuthorizeURL={reAuthorizeURL}
          reData={data}
        />
      </div>
    </DashboardShell>
  )
}
