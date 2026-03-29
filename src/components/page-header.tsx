import type { ReactNode } from 'react'
import { Badge } from './ui/badge'

export function PageHeader({
    title,
    description,
    children
}: {
    title: string
    description: string
    children?: ReactNode
}) {
    return (
        <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
                <h1 className='font-bold text-2xl'>{title}</h1>
                <p className='text-muted-fg text-sm'>{description}</p>
            </div>
            {children}
        </div>
    )
}

export const getBadge = (text: string) => {
    switch (text) {
        case 'P':
            return <Badge intent='success'>{text}</Badge>
        case 'S':
            return <Badge intent='info'>{text}</Badge>
        case 'M':
            return <Badge intent='warning'>{text}</Badge>
        case 'L':
            return <Badge intent='secondary'>{text}</Badge>
        default:
            return <Badge intent='outline'>{text}</Badge>
    }
}
