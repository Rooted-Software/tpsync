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
  


export default async function ConnectFEDebitAccount() {
    const user = await getCurrentUser()
    console.log(user);
  return (
    <>
  
      <div className="bg-dark text-white lg:p-8">
        <div className="m-auto flex w-full max-w-xl flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>STEP 4:</span>  Select your default DEBIT account.
              
            </p>
            <UniversalSelect title="Save and Continue" route="/api/feAccounts" method="GET" subType='debit' fields={['account_id', 'account_number', 'description', 'class']} selected={user?.team?.defaultDebitAccount} redirect='/step4b' />
          </div>
        </div>
   
      </div>
  
    </>
  )
}
