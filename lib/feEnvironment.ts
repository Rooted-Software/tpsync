
import { db } from '@/lib/db'

export const getFeEnvironment = async (user) => {
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