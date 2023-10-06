import { ApiCallButton } from "@/components/dashboard/api-call-button"
import { UniversalSelect } from "@/components/dashboard/universal-select"
import { VirtuousSettingsForm } from "@/components/dashboard/virtuous-settings"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { User } from "@prisma/client"
import { cache } from "react"

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
}

const getApiKey = cache(async (teamId: User["teamId"]) => {
  if (!teamId) return null
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

export default async function ConnectVirtuousOrg() {
  const user = await getCurrentUser()
  console.log(user)
  const data = await getApiKey(user?.team.id)
  return (
    <>
      <div className="bg-dark text-white">
        <div className="m-auto flex h-screen w-full max-w-xl flex-col content-center justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-left ">
            <p className="justify-left text-lg text-white">
              <span className="text-accent-1">STEP 1b:</span> Paste in your
              Virtuous API Key..
            </p>
            <VirtuousSettingsForm apiKey={data?.virtuousAPI || ""} />
            <ApiCallButton />
          </div>
        </div>
      </div>
    </>
  )
}
