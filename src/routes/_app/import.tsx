import { createFileRoute } from '@tanstack/react-router'
import { useActionState, useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import Form from '#/components/forms'
import { PageHeader } from '#/components/page-header'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Note } from '#/components/ui/note'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '#/components/ui/table'
import { parseToISO } from '#/lib/utils'
import { adminMiddleware } from '#/middleware/admin'
import { getExistingShifts } from '#/service/get-existing-shifts'
import { importFile } from '#/service/import-file'

type RowData = {
    date: string
    [group: string]: any
}

export const Route = createFileRoute('/_app/import')({
    server: {
        middleware: [adminMiddleware]
    },
    component: RouteComponent
})

function RouteComponent() {
    const [rows, setRows] = useState<RowData[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [diffMap, setDiffMap] = useState<Record<string, 'new' | 'changed' | 'same'>>({})

    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '', raw: false })

        if (!raw.length) return

        const headers = Object.keys(raw[0]).filter((h) => h !== 'DATE')

        const parsed: RowData[] = raw.map((r) => {
            const { DATE, ...rest } = r

            const obj: RowData = { date: parseToISO(DATE) }

            for (const key of Object.keys(rest)) {
                obj[key] = rest[key]
            }
            return obj
        })

        setHeaders(headers)
        setRows(parsed)

        const existing = await getExistingShifts({
            data: {
                rows: parsed,
                headers: headers
            }
        })

        const diff: Record<string, 'new' | 'changed' | 'same'> = {}

        parsed.forEach((r) => {
            headers.forEach((h) => {
                const key = `${h}-${r.date}`

                const oldVal = existing[key]
                const newVal = r[h]

                if (!oldVal) diff[key] = 'new'
                else if (oldVal !== newVal) diff[key] = 'changed'
                else diff[key] = 'same'
            })
        })

        setDiffMap(diff)
    }

    const getBadge = (type: string) => {
        if (type === 'new') return <Badge intent='info'>New</Badge>
        if (type === 'changed') return <Badge intent='warning'>Changed</Badge>
        return <Badge>Same</Badge>
    }

    const handleCancel = () => {
        setRows([])
        setHeaders([])
        setDiffMap({})
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const [state, action, isPending] = useActionState(
        async (_: any, data: FormData) => await importFile({ data }),
        null
    )

    useEffect(() => {
        if (state?.success) {
            handleCancel()
        }
    }, [state])

    return (
        <Form action={action} className='space-y-4'>
            <PageHeader description='Silahkan unggah file dengan format yang benar' title='Impor Shift' />
            <Card>
                <CardHeader>
                    <Input
                        accept='.csv,.xlsx'
                        aria-label='upload'
                        name='file'
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFile(file)
                        }}
                        ref={inputRef}
                        type='file'
                    />
                    {state?.errors && state?.errors.length > 0 && (
                        <Note intent='danger'>
                            {state?.errors?.map((error, i) => (
                                <p key={i}>
                                    {error.row} : {error.message}
                                </p>
                            ))}
                        </Note>
                    )}
                    {state?.success && (
                        <Note intent='success'>
                            {state.message}, {state.inserted} Data berhasil diimpor
                        </Note>
                    )}
                </CardHeader>

                {rows.length > 0 && (
                    <CardContent className='relative max-h-96 overflow-auto [--card-spacing:var(--gutter)]'>
                        <Table
                            aria-label='Data'
                            bleed
                            className='[--gutter:var(--card-spacing)] sm:[--gutter:var(--card-spacing)]'
                        >
                            <TableHeader>
                                <TableColumn id='date' isRowHeader>
                                    Date
                                </TableColumn>
                                {headers.map((h) => (
                                    <TableColumn key={h}>{h}</TableColumn>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{row.date}</TableCell>
                                        {headers.map((h) => {
                                            const key = `${h}-${row.date}`
                                            const type = diffMap[key]

                                            return (
                                                <TableCell className='space-x-2' key={h}>
                                                    {type && getBadge(type)}
                                                    <span>{row[h]}</span>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
                <CardFooter className='justify-end gap-4'>
                    {rows.length > 0 && (
                        <Button intent='secondary' onPress={handleCancel} type='button'>
                            Cancel
                        </Button>
                    )}
                    <Button isDisabled={!rows.length} isPending={isPending} type='submit'>
                        Import
                    </Button>
                </CardFooter>
            </Card>
        </Form>
    )
}
