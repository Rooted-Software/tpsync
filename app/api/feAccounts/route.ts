
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { reFetch } from '@/lib/reFetch'               

async function upsertAccount(account, userId) {
  await db.feAccount.upsert({
    where: {
      account_id_userId: { 
        account_id: account.account_id,
        userId: userId
      },
    },
    update: {         
      account_number: account.account_number,       
      description: account.description,          
      prevent_data_entry: account.prevent_data_entry,
      prevent_posting_data: account.prevent_posting,
      class: account.class,
      cashflow: account.cashflow,
      working_capital: account.working_capital,
      custom_fields: account.custom_fields,
      default_transaction_codes: account.default_transaction_codes, 
      date_added: account.date_added,          
      added_by: account.added_by,
      date_modified: new Date(account.date_modified),
      modified_by: account.modified_by,
      updatedAt: new Date(),       
      userId: userId,                  
    },
    create: {
      account_id: account.account_id,
      account_number: account.account_number,       
      description: account.description,          
      prevent_data_entry: account.prevent_data_entry,
      prevent_posting_data: account.prevent_posting,
      class: account.class,
      cashflow: account.cashflow,
      working_capital: account.working_capital,
      custom_fields: account.custom_fields,
      default_transaction_codes: account.default_transaction_codes, 
      date_added: account.date_added,          
      added_by: account.added_by,
      date_modified: new Date(account.date_modified),
      modified_by: account.modified_by,
      updatedAt: new Date(),       
      userId: userId,              
    },
  })
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('RE Accounts')
    try {
      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/accounts','GET', user.id
      )
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res2;
      }
      console.log('returning something else')
      const data = await res2.json()
      data?.value.forEach((account) => {
        upsertAccount(account, session.user.id)
      })
      return new Response(JSON.stringify(data.value));
    } catch (error) {
      return error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}








