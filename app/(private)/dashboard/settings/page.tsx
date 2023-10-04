import { AnedotWebhookForm } from "@/components/dashboard/anedot-webhook-form"
import { RESettingsForm } from "@/components/dashboard/re-settings"
import { UniversalSelect } from "@/components/dashboard/universal-select"
import { VirtuousSettingsForm } from "@/components/dashboard/virtuous-settings"
import { DashboardHeader } from "@/components/header"
import { DashboardShell } from "@/components/shell"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserNameForm } from "@/components/user-name-form"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { User } from "@prisma/client"
import { redirect } from "next/navigation"
import { cache } from "react"

const { AuthorizationCode } = require("simple-oauth2")

const feSettingsForUser = cache(async (teamId) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_name: true,
      legal_entity_id: true,
      email: true,
      expires_in: true,
    },
    where: {
      teamId: teamId,
    },
  })
})

const config = {
  client: {
    id: process.env.AUTH_CLIENT_ID,
    secret: process.env.AUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://app.blackbaud.com/oauth/authorize",
  },
}
var crypto
crypto = require("crypto")
const client = new AuthorizationCode(config)
const stateID = crypto.randomBytes(48).toString("hex")
const reAuthorizeURL = client.authorizeURL({
  redirect_uri: process.env.AUTH_REDIRECT_URI,
  state: stateID,
})
console.log("here goes")
console.log(reAuthorizeURL)
const getApiKey = cache(async (teamId) => {
  return await db.apiSetting.findFirst({
    where: {
      teamId: teamId,
    },
    select: {
      id: true,
      virtuousAPI: true,
    },
  })
})

const getAnedotWebhooks = async (team) => {
  return await db.anedotWebhook.findMany({
    select: {
      id: true,
      account_name: true,
      account_uid: true,
      webhook_secret: true,
      active: true,
    },
    where: {
      teamId: team.id,
    },
  })
}

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user || user === undefined) {
    redirect(authOptions?.pages?.signIn || "/login")
  }
  const apiKeyData = getApiKey(user.team.id)
  const feSettingsData = feSettingsForUser(user.team.id)
  const anedotWebhookData = getAnedotWebhooks(user.team)

  const [apiKey, feSettings, anedotWebhooks] = await Promise.all([
    apiKeyData,
    feSettingsData,
    anedotWebhookData,
  ])
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10 text-left">
        {/*}
          <Card className="m-0 p-0">
            <CardHeader className="m-0 p-0">
              <CardTitle className="text-md m-0 p-0 font-normal text-accent-1">
                Setup Wizard
              </CardTitle>
            </CardHeader>
            <CardContent className="m-0 px-0">
              <div className="text-md m-0 p-0 text-white">
                Use the Setup Wizard to reconfigure defaults
              </div>
              <div className="grid gap-1">
                <label className="sr-only" htmlFor="name">
                  Setup Wizard
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <a
                href="/step3"
                className="relative inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <span>Setup Wizard</span>
              </a>
            </CardFooter>
          </Card> */}
        {feSettings !== null ? (
          <>
            <div className="flex ">
              <div>
                <div className="mr-4 flex flex-col space-y-2 text-left ">
                  <span className="text-accent-1">Default Journal</span> Select
                  your default journal from Financial Edge.
                  <div className="justify-left text-md mr-4 justify-center p-2 text-center text-white">
                    <UniversalSelect
                      title="Save"
                      route="/api/reJournals"
                      method="GET"
                      fields={["journal_code_id", "code", "journal"]}
                      selected={user?.team.defaultJournal}
                      redirect="/dashboard/settings"
                    />
                  </div>
                </div>

                <div className="mr-4 flex flex-col space-y-2 text-left ">
                  <span className="text-accent-1">Default Debit Account</span>{" "}
                  Select your default debit account from Financial Edge.
                  <div className="justify-left  mr-4 flex flex-col justify-center space-y-2 p-2 text-center text-white">
                    <UniversalSelect
                      title="Save"
                      route="/api/feAccounts"
                      method="GET"
                      subType="debit"
                      fields={[
                        "account_id",
                        "account_number",
                        "description",
                        "class",
                      ]}
                      selected={user?.team.defaultDebitAccount}
                      redirect="/dashboard/settings"
                    />
                  </div>
                </div>
                <div className="mr-4 flex flex-col space-y-2 text-left ">
                  <span className="text-accent-1">Default Credit Account</span>{" "}
                  Select your default credit account from Financial Edge.
                  <div className="justify-left  mr-4 justify-center p-2 text-center text-white ">
                    <UniversalSelect
                      title="Save"
                      route="/api/feAccounts"
                      method="GET"
                      fields={[
                        "account_id",
                        "account_number",
                        "description",
                        "class",
                      ]}
                      subType="credit"
                      selected={user?.team.defaultCreditAccount}
                      redirect="/dashboard/settings"
                    />
                  </div>
                </div>
              </div>
              <div></div>
            </div>
          </>
        ) : null}
        {
          <div className="grid gap-10">
            <VirtuousSettingsForm apiKey={apiKey?.virtuousAPI} />
          </div>
        }{" "}
        {/* 
        <div className="grid gap-10">
          {user?.name ? (
            <RESettingsForm
              user={{ id: user.id, name: user.name }}
              reAuthorizeURL={reAuthorizeURL}
              reData={data}
            />
          ) : null}
        </div>*/}
        <div className="grid gap-10">
          <AnedotWebhookForm anedotWebhooks={anedotWebhooks} />
        </div>
      </div>
    </DashboardShell>
  )
}
