import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import db from '#/db'

const normalize = (str: string) => str.trim().toUpperCase()

export const getExistingShifts = createServerFn({ method: 'POST' })
    .inputValidator(
        z.object({
            rows: z.array(z.record(z.any(), z.any())),
            headers: z.array(z.string())
        })
    )
    .handler(async ({ data }) => {
        const { rows, headers } = data

        const dates = Array.from(
            new Set(
                rows
                    .map((r) => r.date || r.DATE)
                    .filter(Boolean)
                    .map((d) => new Date(d).toISOString()) // Convert to datetime string
            )
        )

        if (!dates.length || !headers.length) {
            return {}
        }

        // =========================
        // 2. Ambil group dari DB
        // =========================
        const groups = await db.group.findMany({
            where: {
                name: {
                    in: headers.filter((h) => h !== normalize('date'))
                }
            }
        })

        if (!groups.length) return {}

        const groupIds = groups.map((g) => g.id)

        // Map id -> name
        const groupIdToName = Object.fromEntries(groups.map((g) => [g.id, g.name]))

        // =========================
        // 3. Query shift existing
        // =========================
        const shifts = await db.shiftPattern.findMany({
            where: {
                groupId: { in: groupIds },
                date: { in: dates }
            },
            select: {
                groupId: true,
                date: true,
                shiftCode: true
            }
        })

        // =========================
        // 4. Format ke lookup map
        // =========================
        const result: Record<string, string> = {}

        for (const s of shifts) {
            const groupName = groupIdToName[s.groupId]
            const dateStr = s.date.toISOString().slice(0, 10)

            const key = `${groupName}-${dateStr}`
            result[key] = normalize(s.shiftCode)
        }

        return result
    })
