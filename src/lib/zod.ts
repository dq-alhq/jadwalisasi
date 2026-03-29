import { z } from 'zod'

export const emailSchema = z.email({ message: 'Email tidak valid' })

export const passwordSchema = z.string().min(8, { message: 'Password minimal 8 karakter' })

export const rememberMeSchema = z.coerce.boolean().optional()

export const loginSchema = z.object({
    username: z.string().min(1, { message: 'Mohon isi dengan benar' }),
    password: passwordSchema,
    rememberMe: rememberMeSchema
})

export const filterSchema = z.object({
    order: z.enum(['asc', 'desc']).catch('desc').default('desc'),
    page: z.number().catch(1).default(1),
    q: z.string().catch('').default(''),
    show: z.number().catch(10).default(10),
    sort: z.string().catch('createdAt').default('createdAt')
})

const dateSchema = z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

export function formatDateFull(date: Date) {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const yyyy = date.getFullYear()
    const mm = pad(date.getMonth() + 1)
    const dd = pad(date.getDate())
    const hh = pad(date.getHours())
    const mi = pad(date.getMinutes())
    const ss = pad(date.getSeconds())
    const ms = date.getMilliseconds().toString().padStart(3, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.${ms}`
}

const _dateTimeSchema = z
    .preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
            return new Date(arg)
        }
    }, z.date())
    .transform((date) => formatDateFull(date))

export const genderSchema = z.union([z.literal('L'), z.literal('P')])
export const diagnosisStatusSchema = z.union([z.literal('RALAN'), z.literal('RAWIN'), z.literal('RUJUK')])

export const userSchema = z.object({
    email: z.email(),
    image: z.string().optional().nullable(),
    name: z.string(),
    phone: z.string().optional().nullable(),
    role: z.string()
})

export const patientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Nama wajib diisi'),
    rmNumber: z.string().min(1, 'No. RM wajib diisi'),
    bpjsKesNumber: z.string().optional().nullable(),
    nik: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    gender: genderSchema,
    dob: dateSchema,
    email: z.email().optional().nullable(),
    weight: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    bloodPressure: z.string().optional().nullable(),
    bloodType: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    contactName: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactRelationship: z.string().optional().nullable()
})

export const doctorSchema = z.object({
    id: z.string().optional(),
    email: z.email().optional().nullable(),
    image: z.string().optional().nullable(),
    name: z.string(),
    phone: z.string().optional().nullable(),
    speciality: z.string()
})

export const roomSchema = z.object({
    id: z.string().optional(),
    capacity: z.number().optional().nullable(),
    class: z.string(),
    name: z.string(),
    price: z.number().optional().nullable()
})

export const diagnosisRefSchema = z.object({
    code: z.string(),
    defaultChecklist: z.any().optional().nullable(),
    description: z.string().optional().nullable(),
    name: z.string()
})

export const medicalRecordSchema = z.object({
    id: z.string().optional(),
    patientId: z.string(),
    roomId: z.string().optional().nullable(),
    doctorId: z.string(),
    diagnosisRefId: z.string(),
    status: diagnosisStatusSchema,
    level: z.coerce.number(),
    symptoms: z.any().optional().nullable(),
    notes: z.string().optional().nullable(),
    checkinDate: z.coerce.date(),
    checkoutDate: z.coerce.date().optional().nullable(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional().nullable()
})

export const medicalRecordChecklistSchema = z.object({
    checked: z.boolean(),
    createdBy: z.string(),
    medicalRecordId: z.string(),
    name: z.string(),
    required: z.boolean(),
    updatedBy: z.string().optional().nullable()
})

export const billingSchema = z.object({
    createdBy: z.string(),
    invoice: z.string(),
    medicalRecordId: z.string(),
    paid: z.boolean(),
    paidDate: dateSchema.optional().nullable(),
    total: z.number(),
    updatedBy: z.string().optional().nullable()
})

export const billingItemSchema = z.object({
    billingId: z.string(),
    description: z.string().optional().nullable(),
    name: z.string(),
    price: z.number(),
    quantity: z.number()
})

export const parseError = (error: any) => z.flattenError(error).fieldErrors

export const parseFormData = (data: FormData) => {
    const formData: Record<string, string> = {}
    data.forEach((value, key) => {
        if (typeof value === 'string') {
            formData[key] = value
        }
    })
    return formData
}
