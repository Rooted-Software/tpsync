import { AnedotEvents } from "@/components/anedotEvents"
import { UserAccountNav } from "@/components/user-account-nav"
import { getAnedotEvents, getAnedotEventsCount } from "@/lib/anedot"
import { generateEventQuery } from "@/lib/anedot"
import { getCurrentUser } from "@/lib/session"
import { get } from "http"
import { redirect } from "next/navigation"
import { json } from "stream/consumers"

export const metadata = {
  title: "Review Incoming Anedot Transactions",
  description: "Double Check Your Mapping Before Syncing.",
}

export default async function ReveiwDataPage({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const { filterObj, orderBy, page } = generateEventQuery(searchParams)

  const eventData = getAnedotEvents(
    user.teamId,
    page * 25,
    25,
    filterObj,
    orderBy
  )
  const countData = getAnedotEventsCount(user.teamId, filterObj, orderBy)

  const [anedotEvents, eventCount] = await Promise.all([eventData, countData])
  console.log("Event Data")
  console.log(eventCount)
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
        <AnedotEvents anedotEvents={anedotEvents} eventCount={eventCount} />
      </div>
    </>
  )
}
