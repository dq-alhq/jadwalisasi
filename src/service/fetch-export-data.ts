import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import db from '#/db'

const exportDataSchema = z.object({
    start: z.string(),
    end: z.string(),
    groupIds: z.array(z.string()).default([])
})

export const fetchExportData = createServerFn({ method: 'POST' })
    .inputValidator(exportDataSchema)
    .handler(async ({ data }) => {
        const { start, end, groupIds } = data

        const groupFilter =
            groupIds.length > 0
                ? {
                      in: groupIds,
                      notIn: ['none']
                  }
                : { notIn: ['none'] }

        const users = await db.user.findMany({
            where: {
                groupId: groupFilter
            },
            select: {
                id: true,
                name: true,
                group: true
            },
            orderBy: { groupId: 'asc' }
        })

        const patterns = await db.shiftPattern.findMany({
            include: {
                group: true
            },
            where: {
                date: {
                    gte: new Date(start),
                    lte: new Date(end)
                },
                groupId: groupFilter
            }
        })

        const schedules = await db.schedule.findMany({
            where: {
                date: {
                    gte: new Date(start),
                    lte: new Date(end)
                }
            },
            include: {
                user: true
            }
        })

        return {
            users,
            patterns,
            schedules
        }
    })
