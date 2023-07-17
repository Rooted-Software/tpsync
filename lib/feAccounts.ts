import { db } from '@/lib/db'
import { reFetch } from '@/lib/reFetch'


export const getFeAccounts = async (user) => {
    let accounts =  await db.feAccount.findMany({
      select: {
        account_id: true,
        account_number: true,       
        description: true,          
        class: true,
        cashflow: true,
        working_capital: true,
        default_transaction_codes: true, 
    
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        description: 'asc',
      },
    })

    if (accounts && accounts.length < 1) {
      console.log('call blackbaud api')
      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/accounts','GET', user.id)
      if (res2.status !== 200) {
        console.log('no accounts found')

      } else { 
        console.log('got accounts')
        const data = await res2.json()
        data?.value.forEach((account) => {
          upsertFeAccount(account, user.id)
        })
      }
     return accounts =  await db.feAccount.findMany({
        select: {
          account_id: true,
          account_number: true,       
          description: true,          
          class: true,
          cashflow: true,
          working_capital: true,
          default_transaction_codes: true, 
        },
        where: {
          userId: user.id,
        },
        orderBy: {
          description: 'asc',
        },
      })
    }
    return accounts 
  }


export async function upsertFeAccount(account, userId) {
  console.log('upsert account');
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
        date_added: null,          
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
        date_added: null,          
        added_by: account.added_by,
        date_modified: new Date(account.date_modified),
        modified_by: account.modified_by,
        updatedAt: new Date(),       
        userId: userId,              
      },
    })

    console.log('Done upsert account'); 
  }