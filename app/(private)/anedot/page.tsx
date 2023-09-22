
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { MainNav } from '@/components/main-nav'
import { UserAccountNav } from '@/components/user-account-nav'
import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { notFound } from 'next/navigation'
import { getAnedotEvents } from '@/lib/anedot'
import { Icons } from '@/components/icons'
import { AnedotEvents } from '@/components/anedotEvents'

// need to check if anedot environment is set... not fe
/* 
const getFeEnvironment = async (user) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_id: true,
     
    }, 
    where: {
      teamId: user.team.id,
    }
  })
}
*/
  export const metadata = {
    title: 'Review Incoming Anedot Transactions',
    description: 'Double Check Your Mapping Before Syncing.',
  }




export default async function ReveiwDataPage() {
    const user = await getCurrentUser()
    if (!user) { redirect('/step1') }

        
   
    const eventData = getAnedotEvents(user.teamId, 0, 25)
   
    const [anedotEvents] = await Promise.all([eventData,  ])
    /*
    if (!feEnvironment) { 
      redirect('/step2')
    }
    if (!journalName) { 
      redirect('/step3')
    }
    */
  return (<>
  <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
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
    <div className="container grid w-screen  grid-cols-3 flex-col items-center bg-dark px-4  lg:max-w-none lg:grid-cols-3 lg:px-0">
    {anedotEvents.length >0 ? (
       <AnedotEvents anedotEvents={anedotEvents} />
      
 ) : `getting anedot events...`}
    </div>
    </>
  )
}
