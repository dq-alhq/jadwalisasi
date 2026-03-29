import type React from 'react'
import type { Key } from 'react-aria-components'
import { ArrowRightIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import Form from '#/components/forms'
import { getBadge, PageHeader } from '#/components/page-header'
import { SelectUser } from '#/components/select-user'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import { DatePicker, DatePickerTrigger } from '#/components/ui/date-picker'
import { FieldError, Label } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '#/components/ui/select'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '#/components/ui/table'
import { TextField } from '#/components/ui/text-field'
import db from '#/db'
import { formatDate } from '#/lib/date'
import { authMiddleware } from '#/middleware/auth'

const editScheduleSchema = z.object({
    date: z.string(),
    userId: z.string(),
    shift: z.string()
})

const getInitialData = createServerFn({ method: 'GET' }).handler(async () => {
    const users = await db.user.findMany({
        where: {
            name: { not: 'Administrator' }
        },
        include: {
            group: true
        }
    })
    return users
})

const getChangedShift = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .inputValidator(
        z.object({
            userId: z.string(),
            groupId: z.string()
        })
    )
    .handler(async ({ data }) => {
        const { userId, groupId } = data
        const changedShift = await db.schedule.findMany({
            where: {
                userId
            },
            select: {
                date: true,
                id: true,
                shiftCode: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        group: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        const defaultShift = await db.shiftPattern.findMany({
            where: {
                AND: [
                    {
                        date: {
                            in: changedShift.length > 0 ? changedShift.map((s) => s.date) : undefined
                        }
                    },
                    { groupId }
                ]
            }
        })

        return { changedShift, defaultShift }
    })

const editSchedule = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(editScheduleSchema)
    .handler(async ({ data }) => {
        try {
            await db.schedule.upsert({
                where: {
                    userId_date: {
                        userId: data.userId.split(',')[0],
                        date: new Date(data.date)
                    }
                },
                update: { shiftCode: data.shift },
                create: {
                    date: new Date(data.date),
                    userId: data.userId.split(',')[0],
                    shiftCode: data.shift
                }
            })
            return {
                success: true,
                message: 'Berhasil merubah jadwal'
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.message
            }
        }
    })

const getCurrentShift = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .inputValidator(
        z.object({
            date: z.string(),
            group: z.string(),
            user: z.string().optional()
        })
    )
    .handler(async ({ data, context }) => {
        const defaultShift = await db.shiftPattern.findUnique({
            where: {
                groupId_date: {
                    groupId: data.group,
                    date: new Date(data.date)
                }
            }
        })

        const changedShift = await db.schedule.findUnique({
            where: {
                userId_date: {
                    userId: data.user ? data.user : context.user.id,
                    date: new Date(data.date)
                }
            }
        })

        return changedShift ? changedShift : defaultShift
    })

export const Route = createFileRoute('/_app/edit')({
    loader: async () => await getInitialData(),
    component: RouteComponent
})

function RouteComponent() {
    const users = Route.useLoaderData()
    const now = today(getLocalTimeZone())

    const [selectedUserId, setSelectedUserId] = useState<string>('')
    const [selectedGroupId, setSelectedGroupId] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState(parseDate(now.toString()))
    const [selectedShift, setSelectedShift] = useState<Key | null>('')

    const [currentShift, setCurrentShift] = useState<string>('')

    const fetchCurrentShift = async () => {
        const data = await getCurrentShift({
            data: {
                date: selectedDate.toString(),
                group: selectedGroupId,
                user: selectedUserId
            }
        })
        setCurrentShift(data?.shiftCode ?? '-')
    }

    useEffect(() => {
        if (selectedDate && selectedUserId && selectedGroupId) {
            fetchCurrentShift()
        }
    }, [selectedDate, selectedUserId, selectedGroupId])

    const [changedShifts, setChangedShifts] = useState<
        {
            user: string
            group: string | undefined
            date: string
            oldShift: string | undefined
            shift: string
        }[]
    >([])

    const onSelectUser = async (value: Key | null) => {
        const [userId, groupId] = String(value).split(',')
        setSelectedUserId(userId)
        setSelectedGroupId(groupId)

        const { changedShift, defaultShift } = await getChangedShift({
            data: { userId, groupId }
        })

        setChangedShifts(
            changedShift.map((shift) => ({
                user: shift.user.name,
                group: shift?.user?.group?.name,
                date: formatDate(shift.date),
                oldShift: defaultShift.find((s) => formatDate(s.date) === formatDate(shift.date))?.shiftCode,
                shift: shift.shiftCode
            }))
        )
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.stopPropagation()
        e.preventDefault()

        await editSchedule({
            data: {
                date: selectedDate.toString(),
                userId: selectedUserId,
                shift: String(selectedShift)
            }
        }).then((res) => (res.success ? toast.success(res.message) : toast.error(res.error)))

        // 🔥 refetch
        const { changedShift, defaultShift } = await getChangedShift({
            data: {
                userId: selectedUserId,
                groupId: selectedGroupId
            }
        })

        setChangedShifts(
            changedShift.map((shift) => ({
                user: shift.user.name,
                group: shift?.user?.group?.name,
                date: formatDate(shift.date),
                oldShift: defaultShift.find((s) => formatDate(s.date) === formatDate(shift.date))?.shiftCode,
                shift: shift.shiftCode
            }))
        )

        // optional: refresh current shift juga
        await fetchCurrentShift()
    }

    return (
        <div className='space-y-4'>
            <PageHeader description='Silahkan isi form berikut' title='Ubah Shift' />
            <Form onSubmit={onSubmit}>
                <Card className='[--card-spacing:var(--gutter)]'>
                    <CardHeader>
                        <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-4'>
                            <SelectUser
                                name='userId'
                                onChange={onSelectUser}
                                users={users}
                                value={`${selectedUserId},${selectedGroupId}`}
                            />
                            <DatePicker
                                isDisabled={selectedUserId === '' || selectedGroupId === ''}
                                name='date'
                                onChange={(v) => setSelectedDate(v!)}
                                value={selectedDate}
                            >
                                <Label>Tanggal</Label>
                                <DatePickerTrigger />
                                <FieldError />
                            </DatePicker>
                            <TextField isReadOnly value={currentShift}>
                                <Label>Shift Saat ini</Label>
                                <Input />
                            </TextField>
                            <Select name='shift' onChange={setSelectedShift} value={selectedShift}>
                                <Label>Ubah Jadi</Label>
                                <SelectTrigger />
                                <SelectContent>
                                    <SelectItem id='P'>P</SelectItem>
                                    <SelectItem id='S'>S</SelectItem>
                                    <SelectItem id='M'>M</SelectItem>
                                    <SelectItem id='OFF'>OFF</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table
                            aria-label='Users'
                            bleed
                            className='[--gutter:var(--card-spacing)] sm:[--gutter:var(--card-spacing)]'
                        >
                            <TableHeader>
                                <TableColumn isRowHeader>Tanggal</TableColumn>
                                <TableColumn>Nama</TableColumn>
                                <TableColumn>Grup</TableColumn>
                                <TableColumn>Shift</TableColumn>
                                <TableColumn />
                            </TableHeader>
                            <TableBody
                                items={changedShifts}
                                renderEmptyState={() => (
                                    <div className='flex h-12 w-full items-center justify-center'>Tidak ada data</div>
                                )}
                            >
                                {(item) => (
                                    <TableRow id={item.date}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell>{item.user}</TableCell>
                                        <TableCell>{item.group}</TableCell>
                                        <TableCell>
                                            <div className='flex items-center space-x-2'>
                                                {getBadge(item.oldShift || '-')}
                                                <ArrowRightIcon className='size-4' />
                                                {getBadge(item.shift || '-')}
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-end last:pr-2.5'>
                                            <Button intent='danger' size='sq-xs'>
                                                <TrashIcon />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button isDisabled={selectedUserId === '' || currentShift === ''} type='submit'>
                            Simpan
                        </Button>
                    </CardFooter>
                </Card>
            </Form>
        </div>
    )
}
