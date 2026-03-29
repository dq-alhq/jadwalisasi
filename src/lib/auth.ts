import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { admin, username } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { passwordSchema } from '#/lib/zod'
import db from '@/db'

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        disableSignUp: true,
        enabled: true,
        requireEmailVerification: false
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === '/reset-password' || ctx.path === '/change-password') {
                const password = ctx.body.password || ctx.body.newPassword
                const { error } = passwordSchema.safeParse(password)
                if (error) {
                    throw new APIError('BAD_REQUEST', {
                        message: 'Password kurang kuat'
                    })
                }
            }
        })
    },
    plugins: [tanstackStartCookies(), admin(), username()],
    secret: process.env.BETTER_AUTH_SECRET,
    user: {
        additionalFields: {
            groupId: {
                type: 'string',
                required: false
            }
        },
        changeEmail: {
            enabled: true
        }
    }
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
