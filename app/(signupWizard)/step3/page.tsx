import { RESettingsForm } from '@/components/dashboard/re-settings'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { UniversalSelect } from '@/components/dashboard/universal-select'

import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { UserAuthForm } from '@/components/user-auth-form'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Stepper } from '@/components/stepper'


  export const metadata = {
    title: 'Create an account',
    description: 'Create an account to get started.',
  }
  


export default async function ConnectFEPage() {
    const user = await getCurrentUser()

  return (
    <div className="container grid w-screen  flex-col items-center bg-dark  pt-48 lg:max-w-none lg:grid-cols-1 lg:px-0">
  
      <div className="bg-dark text-white lg:p-8">
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center">
            
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>STEP 3:</span>  Select your journal from Financial Edge.
              
            </p>
            <UniversalSelect title="Save and Continue" route="/api/reJournals" method="GET" fields={['journal_code_id', 'code', 'journal']} redirect='/step3b' />
          </div>
        </div>
   
      </div>
      <Stepper percent={25} />
    </div>
  )
}
