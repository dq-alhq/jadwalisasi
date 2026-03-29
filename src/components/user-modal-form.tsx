import type { Group, User } from '#/generated/client'
import { useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { auth } from '#/lib/auth'
import { emailSchema } from '#/lib/zod'
import { adminMiddleware } from '#/middleware/admin'
import Form from './forms'
import { Button } from './ui/button'
import { FieldError, FieldGroup, Label } from './ui/field'
import { ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from './ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'

const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'Harap input dengan benar' }),
    email: emailSchema,
    username: z.string().lowercase({ message: 'Huruf kecil' }).min(1, { message: 'Harap input dengan benar' }),
    password: z.string().catch('password').default('password'),
    admin: z.coerce.boolean().default(false),
    groupId: z.string().optional()
})

export const createOrUpdateUser = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator((data: FormData) => userSchema.safeParse(Object.fromEntries(data)))
    .handler(async ({ data }) => {
        const { error, success, data: parsedData } = data
        if (!success) {
            return {
                error: z.flattenError(error),
                success: false
            }
        }

        try {
            if (parsedData.id) {
                const headers = await getRequestHeaders()
                await auth.api.adminUpdateUser({
                    body: {
                        userId: parsedData.id,
                        data: {
                            ...parsedData
                        }
                    },
                    headers
                })
            } else {
                await auth.api.createUser({
                    body: {
                        email: parsedData.email,
                        password: 'password',
                        name: parsedData.name,
                        role: parsedData.admin ? 'admin' : 'user',
                        data: {
                            ...parsedData
                        }
                    }
                })
            }
            return {
                message: parsedData.id ? 'Pengguna berhasil diupdate' : 'Pengguna berhasil dibuat',
                success: true
            }
        } catch (error: any) {
            return {
                error: z.flattenError(error),
                message: error.message,
                success: false
            }
        }
    })

export const UserModalForm = ({
    isOpen,
    onOpenChange,
    user,
    groups
}: {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    user?: User
    groups: Group[]
}) => {
    const [state, action, isPending] = useActionState(
        async (_: any, data: FormData) => await createOrUpdateUser({ data }),
        null
    )
    const { navigate } = useRouter()

    useEffect(() => {
        if (state?.success) {
            toast.success(state?.message)
            onOpenChange(false)
            navigate({ to: '/dashboard' })
        }
    }, [state])
    return (
        <ModalContent isOpen={isOpen} onOpenChange={onOpenChange} size='4xl'>
            <ModalHeader>
                <ModalTitle>{user?.id ? 'Edit' : 'Tambah'} User</ModalTitle>
                <ModalDescription>Silakan isi form dibawah ini</ModalDescription>
            </ModalHeader>
            <Form action={action} validationErrors={state?.error?.fieldErrors}>
                <ModalBody>
                    <FieldGroup>
                        <input aria-label='id' name='id' type='hidden' value={user?.id ?? ''} />
                        <Form.Text defaultValue={user?.name} label='Nama Lengkap' name='name' />
                        <Form.Text defaultValue={user?.username ?? ''} label='Username' name='username' />
                        <Form.Email defaultValue={user?.email} label='Email' name='email' />
                        <input aria-label='password' name='password' type='hidden' value='password' />
                        <Select
                            aria-label='Group'
                            defaultValue={user?.groupId}
                            name='groupId'
                            placeholder='X'
                            selectionMode='single'
                        >
                            <Label>Group</Label>
                            <SelectTrigger />
                            <FieldError />
                            <SelectContent items={groups}>
                                {(item: Group) => (
                                    <SelectItem id={item.id} textValue={item.name}>
                                        {item.name}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Form.Checkbox defaultValue={user?.role === 'admin'} label='Admin' name='admin' />
                    </FieldGroup>
                </ModalBody>
                <ModalFooter>
                    <Button intent='secondary' slot='close'>
                        Batal
                    </Button>
                    <Form.Button isPending={isPending} label='Simpan' />
                </ModalFooter>
            </Form>
        </ModalContent>
    )
}
