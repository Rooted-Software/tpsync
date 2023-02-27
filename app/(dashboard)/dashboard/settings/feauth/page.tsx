import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import { RESettingsForm } from '@/components/dashboard/re-settings'
import { UserNameForm } from '@/components/dashboard/user-name-form'
import { VirtuousSettingsForm } from '@/components/dashboard/virtuous-settings'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'




export default async function SettingsPage() {
  const user = await getCurrentUser() 
  const redirectPage = '/dashboard/settings/feauth/authorize';
  console.log(
    'here goes in function'
  )
  console.log(authorizeURL)
  new Response("", {
    status: 302,
    headers: {
      Location: authorizeURL,
    },
  });

}
