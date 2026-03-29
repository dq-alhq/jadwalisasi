import type { Group } from '#/generated/client'
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
import dayjs from 'dayjs'
import { useState } from 'react'
import { exportViewExcel } from '#/service/export-view-excel'
import { fetchExportData } from '#/service/fetch-export-data'
import { ExcelIcon } from './icons'
import { Button } from './ui/button'
import { DateRangePicker, DateRangePickerTrigger } from './ui/date-range-picker'
import { Label } from './ui/field'
import { ModalBody, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from './ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'

export const ExportModal = ({
    isOpen,
    onOpenChange,
    groups
}: {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    groups: Group[]
}) => {
    const now = today(getLocalTimeZone())
    const endOfDate = today(getLocalTimeZone()).add({ months: 1 }).subtract({ days: 1 })
    const [selectedGroups, setSelectedGroups] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<{ start: DateValue; end: DateValue } | null>({
        start: now,
        end: endOfDate
    })
    const [isExporting, setIsExporting] = useState(false)

    const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')
    const toIsoDate = (value: DateValue) => value.toDate('UTC').toISOString().slice(0, 10)

    const exportData = async () => {
        if (!selectedDate || isExporting) return

        setIsExporting(true)

        try {
            const start = toIsoDate(selectedDate.start)
            const end = toIsoDate(selectedDate.end)

            const { users, patterns, schedules } = await fetchExportData({
                data: {
                    start,
                    end,
                    groupIds: selectedGroups
                }
            })

            const patternMap = new Map<string, string>()

            patterns.forEach((p: { group: { name: string }; date: Date; shiftCode: string }) => {
                const key = `${p.group.name}_${formatDate(p.date)}`
                patternMap.set(key, p.shiftCode)
            })

            const scheduleMap = new Map<string, string>()
            schedules.forEach((s: { user: { name: string }; date: Date; shiftCode: string }) => {
                const key = `${s.user.name}_${formatDate(s.date)}`
                scheduleMap.set(key, s.shiftCode)
            })

            const dates: Date[] = []
            let current = dayjs(start).startOf('day')
            const endDate = dayjs(end).startOf('day')

            while (current.isBefore(endDate) || current.isSame(endDate)) {
                dates.push(current.toDate())
                current = current.add(1, 'day')
            }

            const table = users.map((user: { name: string; group: { name: string } }) => {
                const row: { group: string; name: string; shifts: Record<string, string> } = {
                    group: user.group.name,
                    name: user.name,
                    shifts: {}
                }

                dates.forEach((date) => {
                    const d = formatDate(date)
                    const shift =
                        scheduleMap.get(`${user.name}_${d}`) ?? patternMap.get(`${user.group.name}_${d}`) ?? '-'
                    row.shifts[d] = shift
                })

                return row
            })

            exportViewExcel({
                table,
                dates,
                searchParams: { start, end }
            })
            onOpenChange(false)
        } finally {
            setIsExporting(false)
        }
    }
    return (
        <ModalContent isOpen={isOpen} onOpenChange={onOpenChange} size='4xl'>
            <ModalHeader>
                <ModalTitle>Export Data</ModalTitle>
                <ModalDescription>Silakan pilih data yang ingin di export</ModalDescription>
            </ModalHeader>
            <ModalBody>
                <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
                    <Select
                        aria-label='Group'
                        onChange={(value) => setSelectedGroups(value as string[])}
                        placeholder='All'
                        selectionMode='multiple'
                        value={selectedGroups || []}
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
                    <DateRangePicker onChange={(value) => setSelectedDate(value!)} value={selectedDate}>
                        <Label>Tanggal</Label>
                        <DateRangePickerTrigger />
                    </DateRangePicker>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button intent='secondary' slot='close'>
                    Batal
                </Button>
                <Button isDisabled={isExporting} onPress={exportData}>
                    <ExcelIcon data-slot='icon' />
                    {isExporting ? 'Exporting...' : 'Export'}
                </Button>
            </ModalFooter>
        </ModalContent>
    )
}
