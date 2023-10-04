import * as z from "zod"

export const anedotWebhookSchema = z.object({
  account_name: z.string(),
  account_uid: z.string(),
  webhook_secret: z.string(),
  active: z.boolean(),
})
