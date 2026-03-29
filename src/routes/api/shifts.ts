import { createFileRoute } from '@tanstack/react-router'
import db from '#/db'

export const Route = createFileRoute('/api/shifts')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                console.info(request)
                const data = await db.shiftPattern.findMany()
                return Response.json({ data })
            }
        }
    }
})
