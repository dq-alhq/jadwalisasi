import type { User } from '#/generated/client'
import { EllipsisVerticalIcon, PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import z from 'zod'
import { PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Menu, MenuContent, MenuItem, MenuSeparator } from '#/components/ui/menu'
import { SearchField, SearchInput } from '#/components/ui/search-field'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '#/components/ui/table'
import { UserModalForm } from '#/components/user-modal-form'
import db from '#/db'
import { adminMiddleware } from '#/middleware/admin'

const getUsers = createServerFn({ method: 'GET' })
    .inputValidator(
        z.object({
            q: z.string().optional()
        })
    )
    .handler(async ({ data }) => {
        const { q } = data
        const users = await db.user.findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            include: {
                group: true,
                _count: {
                    select: {
                        schedules: true
                    }
                }
            }
        })
        const total = await db.user.count({
            where: { name: { contains: q, mode: 'insensitive' } }
        })

        const groups = await db.group.findMany()
        return { users, total, groups }
    })

export const Route = createFileRoute('/_app/dashboard')({
    server: {
        middleware: [adminMiddleware]
    },
    loader: async ({ deps }) => await getUsers({ data: deps }),
    loaderDeps: ({ search: { q } }) => ({ q }),
    validateSearch: z.object({
        q: z.string().optional()
    }),
    component: RouteComponent
})

function RouteComponent() {
    const data = Route.useLoaderData()
    const { users, total, groups } = data
    const navigate = Route.useNavigate()
    const searchParams = Route.useSearch()
    const { session } = Route.useRouteContext()

    const handleSearch = useDebouncedCallback((term: string) => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                q: term
            })
        })
    }, 300)

    const [isOpenModal, setIsOpenModal] = useState({
        state: false,
        data: {
            id: '',
            name: '',
            username: '',
            email: '',
            groupId: '',
            role: 'user'
        }
    })

    const onClose = () => {
        setIsOpenModal({
            state: false,
            data: {
                id: '',
                name: '',
                username: '',
                email: '',
                groupId: '',
                role: 'user'
            }
        })
    }
    return (
        <div className='space-y-4'>
            <UserModalForm
                groups={groups}
                isOpen={isOpenModal.state}
                onOpenChange={onClose}
                user={isOpenModal.data as User}
            />
            <PageHeader description={`Total pengguna: ${total}`} title='Dashboard'>
                <Button
                    onPress={() =>
                        setIsOpenModal({
                            state: true,
                            data: {
                                id: '',
                                name: '',
                                username: '',
                                email: '',
                                groupId: '',
                                role: 'user'
                            }
                        })
                    }
                    size='sm'
                >
                    <UserPlusIcon />
                    Tambah User
                </Button>
            </PageHeader>
            <Card className='[--card-spacing:var(--gutter)]'>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <SearchField aria-label='Cari' defaultValue={searchParams.q ?? ''} onChange={handleSearch}>
                            <SearchInput />
                        </SearchField>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table
                        aria-label='Users'
                        bleed
                        className='[--gutter:var(--card-spacing)] sm:[--gutter:var(--card-spacing)]'
                    >
                        <TableHeader>
                            <TableColumn isRowHeader>Nama</TableColumn>
                            <TableColumn>Grup</TableColumn>
                            <TableColumn>Perubahan Jadwal</TableColumn>
                            <TableColumn />
                        </TableHeader>
                        <TableBody items={users}>
                            {(item) => (
                                <TableRow id={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.group?.name}</TableCell>
                                    <TableCell>{item._count.schedules}</TableCell>
                                    <TableCell className='text-end last:pr-2.5'>
                                        <Menu>
                                            <Button
                                                intent='warning'
                                                isDisabled={session?.user?.id === item.id}
                                                size='sq-xs'
                                            >
                                                <EllipsisVerticalIcon />
                                            </Button>
                                            <MenuContent aria-label='Options' placement='left top'>
                                                <MenuItem
                                                    onAction={() =>
                                                        setIsOpenModal({
                                                            state: true,
                                                            data: {
                                                                id: item.id,
                                                                name: item.name,
                                                                username: item.username ?? '',
                                                                email: item.email,
                                                                groupId: item.groupId ?? '',
                                                                role: item.role ?? 'user'
                                                            }
                                                        })
                                                    }
                                                >
                                                    <PencilIcon /> Edit
                                                </MenuItem>
                                                <MenuSeparator />
                                                <MenuItem intent='danger'>
                                                    <TrashIcon /> Delete
                                                </MenuItem>
                                            </MenuContent>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
