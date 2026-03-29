import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')

export const exportViewExcel = ({ table, dates, searchParams }: any) => {
    // =========================
    // HEADER (2 BARIS BIAR RAPIH)
    // =========================
    const headerRow1 = ['Grup', 'Nama', ...dates.map(() => 'Tanggal')]

    const headerRow2 = ['', '', ...dates.map((d: Date) => dayjs(d).format('DD/MM'))]

    // =========================
    // DATA
    // =========================
    const body = table.map((row: any) => [
        row.group,
        row.name,
        ...dates.map((d: Date) => row.shifts[formatDate(d)] || '-')
    ])

    const data = [headerRow1, headerRow2, ...body]

    // =========================
    // SHEET
    // =========================
    const ws = XLSX.utils.aoa_to_sheet(data)

    // =========================
    // COLUMN WIDTH (INI KUNCI UTAMA)
    // =========================
    ws['!cols'] = [
        { wch: 16 }, // Grup
        { wch: 22 }, // Nama
        ...dates.map(() => ({ wch: 7 })) // tanggal konsisten
    ]

    // =========================
    // MERGE HEADER "Tanggal"
    // =========================
    ws['!merges'] = [
        {
            s: { r: 0, c: 2 },
            e: { r: 0, c: 2 + dates.length - 1 }
        },
        // Merge Grup & Nama biar tinggi 2 baris
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }
    ]

    // Set label utama
    ws.C1.v = 'Tanggal'

    // =========================
    // WORKBOOK
    // =========================
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Shift')

    // =========================
    // EXPORT
    // =========================
    XLSX.writeFile(wb, `jadwal_shift_${searchParams.start}_${searchParams.end}.xlsx`)
}
