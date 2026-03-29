import type { Group, Schedule, ShiftPattern, User } from '#/generated/client'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { parseDate } from '@internationalized/date'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import z from 'zod'
import { ExportModal } from '#/components/export-modal'
import { ExcelIcon } from '#/components/icons'
import { getBadge, PageHeader } from '#/components/page-header'
import { Button } from '#/components/ui/button'
import { DateRangePicker, DateRangePickerTrigger } from '#/components/ui/date-range-picker'
import { Label } from '#/components/ui/field'
import { Menu, MenuContent, MenuItem, MenuLabel } from '#/components/ui/menu'
import { SearchField, SearchInput } from '#/components/ui/search-field'
import { Select, SelectContent, SelectItem, SelectTrigger } from '#/components/ui/select'
import { Skeleton } from '#/components/ui/skeleton'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '#/components/ui/table'
import db from '#/db'
import { formatDate } from '#/lib/date'
import { exportViewExcel } from '#/service/export-view-excel'

const scheduleSchema = z.object({
    q: z.string().catch('').default(''),
    start: z.string().default(formatDate(dayjs().startOf('month').toDate())),
    end: z.string().default(formatDate(dayjs().endOf('month').toDate())),
    group: z.array(z.string()).catch([]).default([])
})

const fetchSchedules = createServerFn({ method: 'GET' })
    .inputValidator(scheduleSchema)
    .handler(async ({ data }) => {
        const { q, start, end, group } = data

        const groupId = group.length === 0 ? undefined : group

        const groups = await db.group.findMany({
            where: {
                name: {
                    in: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
                }
            },
            select: {
                id: true,
                name: true
            },
            orderBy: { name: 'asc' }
        })

        const users = await db.user.findMany({
            where: {
                name: { contains: q, mode: 'insensitive' },
                groupId: groupId ? { in: groupId, notIn: ['none'] } : { notIn: ['none'] }
            },
            select: {
                id: true,
                name: true,
                image: true,
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
                }
            }
        })

        const schedules = await db.schedule.findMany({
            where: {
                date: {
                    gte: new Date(start),
                    lte: new Date(end)
                }
            }
        })

        return {
            groups,
            users,
            patterns,
            schedules
        }
    })

export const Route = createFileRoute('/_app/')({
    component: RouteComponent,
    loader: async ({ deps }) =>
        await fetchSchedules({
            data: deps
        }),
    loaderDeps: ({ search: { q, start, end, group } }) => ({
        q,
        start,
        end,
        group
    }),
    validateSearch: scheduleSchema
})

function RouteComponent() {
    const data = Route.useLoaderData()

    const { users, patterns, groups, schedules } = data

    const navigate = Route.useNavigate()
    const searchParams = Route.useSearch()

    const patternMap = new Map<string, string>()

    patterns.forEach((p: ShiftPattern & { group: Group }) => {
        const key = `${p.group.name}_${formatDate(p.date)}`
        patternMap.set(key, p.shiftCode)
    })

    const scheduleMap = new Map<string, string>()

    schedules.forEach((s: Schedule) => {
        const key = `${s.userId}_${formatDate(s.date)}`
        scheduleMap.set(key, s.shiftCode)
    })

    const dates: Date[] = []
    let current = dayjs(searchParams.start || new Date()).startOf('day')

    while (current.isBefore(searchParams.end) || current.isSame(searchParams.end)) {
        dates.push(current.toDate())
        current = current.add(1, 'day')
    }

    const table = users.map((user) => {
        const row: any = {
            group: user?.group?.name,
            name: user.name,
            shifts: {}
        }

        dates.forEach((date) => {
            const d = formatDate(date)

            const shift = scheduleMap.get(`${user.id}_${d}`) ?? patternMap.get(`${user?.group?.name}_${d}`) ?? '-'

            row.shifts[d] = shift
        })

        return row
    })

    const handleSearch = useDebouncedCallback((term: string) => {
        navigate({
            search: (prev: any) => ({
                ...prev,
                q: term
            })
        })
    }, 300)

    const [isExportModalOpen, setIsExportModalOpen] = useState(false)
    const exportData = () => {
        exportViewExcel({
            table,
            dates,
            searchParams
        })
    }
    return (
        <div className='space-y-4'>
            <PageHeader
                description='Menampilkan jadwal shift karyawan berdasarkan filter tanggal dan grup.'
                title='Jadwal Shift'
            >
                <Menu>
                    <Button>
                        <ArrowDownTrayIcon />
                        Export
                    </Button>
                    <MenuContent aria-label='Export' placement='bottom end'>
                        <MenuItem onAction={exportData} textValue='Export Tampil'>
                            <ExcelIcon data-slot='icon' />
                            <MenuLabel>Export Data Yang Ditampilkan</MenuLabel>
                        </MenuItem>
                        <MenuItem onAction={() => setIsExportModalOpen(true)} textValue='Export Semua'>
                            <ExcelIcon data-slot='icon' />
                            <MenuLabel>Export Semua Data</MenuLabel>
                        </MenuItem>
                    </MenuContent>
                </Menu>
                <ExportModal groups={groups} isOpen={isExportModalOpen} onOpenChange={setIsExportModalOpen} />
            </PageHeader>

            <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-3'>
                <SearchField defaultValue={searchParams.q ?? ''} onChange={handleSearch}>
                    <Label>Cari</Label>
                    <SearchInput />
                </SearchField>
                <Select
                    aria-label='Group'
                    onChange={(value) =>
                        navigate({
                            search: (prev: any) => ({
                                ...prev,
                                group: value
                            })
                        })
                    }
                    placeholder='All'
                    selectionMode='multiple'
                    value={searchParams.group || []}
                >
                    <Label>Group</Label>
                    <SelectTrigger />
                    <SelectContent items={groups}>
                        {(item: Group) => (
                            <SelectItem id={item.id} textValue={item.name}>
                                {item.name}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <DateRangePicker
                    defaultValue={{
                        start: parseDate(searchParams.start),
                        end: parseDate(searchParams.end)
                    }}
                    onChange={(newValue) =>
                        navigate({
                            search: (prev: any) => ({
                                ...prev,
                                start: new Date(newValue!.start.toDate('UTC')).toISOString().slice(0, 10),
                                end: new Date(newValue!.end.toDate('UTC')).toISOString().slice(0, 10)
                            })
                        })
                    }
                >
                    <Label>Tanggal</Label>
                    <DateRangePickerTrigger />
                </DateRangePicker>
            </div>
            <div className='relative overflow-auto rounded-lg border bg-bg shadow-sm'>
                <Table aria-label='Jadwal' className='w-full'>
                    <TableHeader>
                        <TableColumn className={'sticky left-0 z-40 bg-bg text-center **:pl-4'} id='group' isRowHeader>
                            Grup
                        </TableColumn>
                        <TableColumn className={'sticky left-14 z-40 bg-bg'} id='name'>
                            Nama
                        </TableColumn>
                        {dates.map((d) => (
                            <TableColumn id={d.toISOString()} key={d.toISOString()}>
                                {dayjs(d).format('DD/MM')}
                            </TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody items={table} renderEmptyState={() => <Skeleton className='m-2 h-7 w-full' />}>
                        {(item: User & { group: string; shifts: Record<string, string> }) => (
                            <TableRow id={item.name}>
                                <TableCell className={'sticky left-0 z-40 bg-bg text-center **:pl-4'}>
                                    {item.group || '-'}
                                </TableCell>
                                <TableCell className={'sticky left-14 z-40 bg-bg'}>{item.name}</TableCell>
                                {dates.map((d) => {
                                    const key = formatDate(d)
                                    return (
                                        <TableCell className='text-center' key={key}>
                                            {getBadge(item.shifts[key] || '-')}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
