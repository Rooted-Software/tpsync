import { db } from "@/lib/db"

// Local DB
export const getAnedotWebhooks = async (team) => {
  return await db.anedotWebhook.findMany({
    select: {
      id: true,
      account_name: true,
      account_uid: true,
      webhook_secret: true,
      active: true,
      teamId: true,
    },
    orderBy: {
      account_name: "asc",
    },
  })
}
