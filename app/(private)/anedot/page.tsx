import { AnedotEvents } from "@/components/anedotEvents"
import { UserAccountNav } from "@/components/user-account-nav"
import { getAnedotEvents } from "@/lib/anedot"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Review Incoming Anedot Transactions",
  description: "Double Check Your Mapping Before Syncing.",
}

export default async function ReveiwDataPage({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/step1")
  }
  console.log(searchParams)
  const page = parseInt(searchParams?.page || "0") || 0

  const eventData = getAnedotEvents(user.teamId, page * 25, 25)

  const [anedotEvents] = await Promise.all([eventData])

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container h-16 items-center justify-between py-4">
          {/* <MainNav items={dashboardConfig.mainNav} /> */}
          <UserAccountNav
            user={{
              name: user.name,
              image: user.image,
              email: user.email,
            }}
          />
        </div>
      </header>
      <div>
        {anedotEvents.length > 0 ? (
          <AnedotEvents anedotEvents={anedotEvents} />
        ) : (
          `getting anedot events...`
        )}
      </div>
    </>
  )
}
