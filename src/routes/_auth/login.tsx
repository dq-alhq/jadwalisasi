import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useActionState, useEffect } from 'react'
import z from 'zod'
import Form from '@/components/forms'
import { AppLogo } from '@/components/icons'
import { Card, CardContent } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { auth } from '@/lib/auth'
import { loginSchema } from '@/lib/zod'

const login = createServerFn({ method: 'POST' })
    .inputValidator((data: FormData) => loginSchema.safeParse(Object.fromEntries(data)))
    .handler(async ({ data }) => {
        const { error, success, data: parsedData } = data
        if (!success) {
            return {
                error: z.flattenError(error),
                success: false
            }
        }
        try {
            await auth.api.signInUsername({ body: parsedData })

            return {
                success: true
            }
        } catch (error: any) {
            return {
                error: {
                    fieldErrors: {
                        username: error?.message
                    }
                },
                field: { username: parsedData?.username },
                success: false
            }
        }
    })

export const Route = createFileRoute('/_auth/login')({
    component: RouteComponent
})

function RouteComponent() {
    const router = useRouter()
    const [state, action, loading] = useActionState(async (_: any, data: FormData) => await login({ data }), null)
    useEffect(() => {
        if (state?.success) {
            router.navigate({ to: '/' })
        }
    }, [state])
    return (
        <Card className='w-full max-w-lg overflow-hidden p-0'>
            <CardContent className='p-0'>
                <Form action={action} className='p-6 md:p-8' validationErrors={state?.error?.fieldErrors}>
                    <Link className='mb-2 flex items-center justify-center gap-2 rounded-lg text-primary' to={'/'}>
                        <span className='flex items-center gap-3 font-bold text-3xl tracking-tighter'>
                            <AppLogo className='size-7' />
                            JADWALISASI
                        </span>
                    </Link>

                    <FieldGroup>
                        <div className='flex flex-col items-center gap-2 text-center'>
                            <p className='text-balance text-muted-foreground'>Masukkan Username untuk Masuk</p>
                        </div>
                        <Form.Text autoFocus defaultValue={state?.field?.username} label='Username' name='username' />
                        <input name='password' type='hidden' value='password' />
                        <Form.Checkbox label='Ingat saya' name='rememberMe' />
                        <Form.Button icon={<ArrowRightEndOnRectangleIcon />} isPending={loading} label='Login' />
                    </FieldGroup>
                </Form>
            </CardContent>
        </Card>
    )
}
