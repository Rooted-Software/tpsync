import { withMethods } from '@/lib/api-middlewares/with-methods'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RequiresProPlanError } from '@/lib/exceptions'
import { getUserSubscriptionPlan } from '@/lib/subscription'
import { Prisma } from '@prisma/client'
import { parseJSON } from 'date-fns'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import * as z from 'zod'

const postCreateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
})

async function upsertGift(gift) {
  await db.gifts.upsert({
    where: {
      id: gift.id || 'none',
    },
    update: {
      transactionSource: gift.transactionSource,
      transactionId: gift.transactionId,
      contactId: gift.contactId,
      contactName: gift.contactName,
      contactUrl: gift.contactUrl,
      giftType: gift.giftType,
      giftTypeFormatted: gift.giftTypeFormatted,
      giftDate: new Date(gift.giftDate),
      giftDateFormatted: gift.giftDateFormatted,
      amount: gift.amount,
      amountFormatted: gift.amountFormatted,
      currencyCode: gift.currencyCode,
      exchangeRate: gift.exchangeRate,
      baseCurrencyCode: gift.baseCurrencyCode,
      batch: gift.batch,
      createDateTimeUtc: new Date(gift.createDateTimeUtc),
      createdByUser: gift.createdByUser,
      modifiedDateTimeUtc: new Date(gift.modifiedDateTimeUtc),
      modifiedByUser: gift.modifiedByUser,
      segmentId: gift.segmentId,
      segment: gift.segment,
      segmentCode: gift.segmentCode,
      segmentUrl: gift.segmentUrl,
      mediaOutletId: gift.mediaOutletId,
      mediaOutlet: gift.mediaOutlet,
      grantId: gift.grantId,
      grant: gift.grant,
      grantUrl: gift.grantUrl,
      notes: gift.notes,
      tribute: gift.tribute,
      tributeId: gift.tributeId,
      tributeType: gift.tributeType,
      acknowledgeIndividualId: gift.acknowledgeIndividualId,
      receiptDate: new Date(gift.receiptDate),
      receiptDateFormatted: gift.receiptDateFormatted,
      contactPassthroughId: gift.contactPassthroughId,
      contactPassthroughUrl: gift.contactPassthroughUrl,
      contactIndividualId: gift.contactIndividual,
      cashAccountingCode: gift.cashAccountingCode,
      giftAskId: gift.giftAskId,
      contactMembershipId: gift.contactMembershipId,
      giftUrl: gift.giftUrl,
      isTaxDeductible: gift.isTaxDeductible,
      giftDesignations: gift.giftDesignations,
      giftPremiums: gift.giftPremiums,
      recurringGiftPayments: gift.recurringGiftPayments,
      pledgePayments: gift.pledgePayments,
      customFields: gift.customFields,
      batch_name: gift.batch_name || 'none',
      synced: false,
    },
    create: {
      id: gift.id,
      transactionSource: gift.transactionSource,
      transactionId: gift.transactionId,
      contactId: gift.contactId,
      contactName: gift.contactName,
      contactUrl: gift.contactUrl,
      giftType: gift.giftType,
      giftTypeFormatted: gift.giftTypeFormatted,
      giftDate: new Date(gift.giftDate),
      giftDateFormatted: gift.giftDateFormatted,
      amount: gift.amount,
      amountFormatted: gift.amountFormatted,
      currencyCode: gift.currencyCode,
      exchangeRate: gift.exchangeRate,
      baseCurrencyCode: gift.baseCurrencyCode,
      batch: gift.batch,
      createDateTimeUtc: new Date(gift.createDateTimeUtc),
      createdByUser: gift.createdByUser,
      modifiedDateTimeUtc: new Date(gift.modifiedDateTimeUtc),
      modifiedByUser: gift.modifiedByUser,
      segmentId: gift.segmentId,
      segment: gift.segment,
      segmentCode: gift.segmentCode,
      segmentUrl: gift.segmentUrl,
      mediaOutletId: gift.mediaOutletId,
      mediaOutlet: gift.mediaOutlet,
      grantId: gift.grantId,
      grant: gift.grant,
      grantUrl: gift.grantUrl,
      notes: gift.notes,
      tribute: gift.tribute,
      tributeId: gift.tributeId,
      tributeType: gift.tributeType,
      acknowledgeIndividualId: gift.acknowledgeIndividualId,
      receiptDate: new Date(gift.receiptDate),
      receiptDateFormatted: gift.receiptDateFormatted,
      contactPassthroughId: gift.contactPassthroughId,
      contactPassthroughUrl: gift.contactPassthroughUrl,
      contactIndividualId: gift.contactIndividual,
      cashAccountingCode: gift.cashAccountingCode,
      giftAskId: gift.giftAskId,
      contactMembershipId: gift.contactMembershipId,
      giftUrl: gift.giftUrl,
      isTaxDeductible: gift.isTaxDeductible,
      giftDesignations: gift.giftDesignations,
      giftPremiums: gift.giftPremiums,
      recurringGiftPayments: gift.recurringGiftPayments,
      pledgePayments: gift.pledgePayments,
      customFields: gift.customFields,
      batch_name: gift.batch_name || 'none',
      synced: false,
    },
  })
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(403).end()
  }

  const { user } = session
  console.log('api - post SYnc Virtuous Gifts')
  console.log(user)
  if (req.method === 'POST') {
    console.log('api call test - POST ')
    try {
      const account = await db.account.findFirst({
        select: {
          id: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(account)
      if (!account) {
        return
      }
      console.log('body')
      console.log(req.body.batch_name)
      const res2 = await fetch(
        'https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${account.access_token}`,
          },
          body: JSON.stringify({
            groups: [
              {
                conditions: [
                  {
                    parameter: 'Batch',
                    operator: 'Is',
                    value: req.body.batch_name,
                  },
                ],
              },
            ],
            sortBy: 'Last Modified Date',
            descending: 'true',
          }),
        }
      )
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res.status(429).end()
      }
      console.log('returning something else')
      const data = await res2.json()

      console.log(data)

      data.list?.forEach((gift) => {
        upsertGift(gift)
      })

      res.status(200).json(data)
    } catch (error) {
      return error
    }
  }
}

export default withMethods(['POST'], handler)
