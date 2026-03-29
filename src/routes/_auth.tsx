import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
    beforeLoad: ({ context }) => {
        if (context.session) {
            throw redirect({ to: '/' })
        }
    },
    component: RouteComponent
})

function RouteComponent() {
    return (
        <div className='flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10'>
            <Outlet />
        </div>
    )
}
