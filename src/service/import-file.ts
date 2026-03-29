import { createServerFn } from '@tanstack/react-start'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import db from '#/db'
import { parseToDateTime } from '#/lib/utils'
import { adminMiddleware } from '#/middleware/admin'

const validShift = ['M', 'S', 'P', 'OFF']

const normalize = (str: string) => str.trim().toUpperCase()

export const importFile = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(z.instanceof(FormData))
    .handler(async ({ data }) => {
        const file = data.get('file') as File

        if (!file || !(file instanceof File)) {
            return { success: false, message: 'File CSV belum dipilih.' }
        }

        try {
            // =========================
            // 1. PARSE FILE
            // =========================
            const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]

            const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
                defval: '',
                raw: false
            })

            if (!rows.length) {
                return { success: false, message: 'CSV kosong.' }
            }

            // =========================
            // 2. EXTRACT GROUP HEADER
            // =========================
            const rawHeaders = Object.keys(rows[0]).filter((h) => h !== 'DATE')
            const headers = rawHeaders.map(normalize)

            // =========================
            // 3. GET + CREATE GROUP
            // =========================
            const existingGroups = await db.group.findMany({
                where: { name: { in: headers } }
            })

            const groupMap: Record<string, string> = {}
            existingGroups.forEach((g) => {
                groupMap[normalize(g.name)] = g.id
            })

            const missingGroups = headers.filter((name) => !groupMap[name])

            if (missingGroups.length > 0) {
                const created = await db.$transaction(
                    missingGroups.map((name) =>
                        db.group.create({
                            data: { name }
                        })
                    )
                )

                created.forEach((g) => {
                    groupMap[normalize(g.name)] = g.id
                })
            }

            // =========================
            // 4. PROCESS ROWS
            // =========================
            const errors: {
                row: number
                message: string
            }[] = []

            const dataToInsert: {
                groupId: string
                date: string
                shiftCode: string
            }[] = []

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i]

                try {
                    const { DATE: dateValue, ...shifts } = row

                    if (!dateValue) {
                        errors.push({ row: i + 2, message: 'Tanggal kosong' })
                        continue
                    }

                    const date = parseToDateTime(dateValue)
                    if (Number.isNaN(date)) {
                        errors.push({ row: i + 2, message: 'Format tanggal tidak valid' })
                        continue
                    }

                    for (const key of Object.keys(shifts)) {
                        const groupName = normalize(key)
                        const groupId = groupMap[groupName]

                        if (!groupId) continue

                        const shiftCode = normalize(shifts[key])

                        if (!shiftCode) continue

                        if (!validShift.includes(shiftCode)) {
                            errors.push({
                                row: i + 2,
                                message: `Shift tidak valid (${shiftCode}) di group ${groupName}`
                            })
                            continue
                        }

                        dataToInsert.push({
                            groupId,
                            date,
                            shiftCode
                        })
                    }
                } catch (err: any) {
                    errors.push({
                        row: i + 2,
                        message: err.message || 'Unknown error'
                    })
                }
            }

            if (!dataToInsert.length) {
                return {
                    success: false,
                    message: 'Tidak ada data valid untuk diimport',
                    errors
                }
            }

            // =========================
            // 5. BULK UPSERT (SUPER CEPAT)
            // =========================
            // strategi:
            // - delete dulu berdasarkan (groupId + date)
            // - lalu createMany

            const uniqueKeys = new Map<string, { groupId: string; date: string }>()

            for (const item of dataToInsert) {
                const key = `${item.groupId}-${item.date}`
                uniqueKeys.set(key, {
                    groupId: item.groupId,
                    date: item.date
                })
            }

            const deleteConditions = Array.from(uniqueKeys.values())

            await db.$transaction([
                // delete existing
                db.shiftPattern.deleteMany({
                    where: {
                        OR: deleteConditions
                    }
                }),

                // bulk insert
                db.shiftPattern.createMany({
                    data: dataToInsert,
                    skipDuplicates: true
                })
            ])

            // =========================
            // 6. RESULT
            // =========================
            return {
                success: true,
                message: 'Import selesai',
                inserted: dataToInsert.length,
                errorCount: errors.length,
                errors
            }
        } catch (err: any) {
            return {
                success: false,
                message: err.message || 'Terjadi kesalahan saat import'
            }
        }
    })
