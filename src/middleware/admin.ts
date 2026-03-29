import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

export const adminMiddleware = createMiddleware().server(async ({ next }) => {
    const headers = await getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (!session || session?.user.role !== 'admin') {
        throw redirect({ to: '/' })
    }

    return await next()
})
