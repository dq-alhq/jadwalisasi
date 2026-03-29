import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppNavbar from '#/components/app-navbar'
import { Container } from '#/components/ui/container'
import { NavbarProvider } from '#/components/ui/navbar'
import { authMiddleware } from '#/middleware/auth'

export const Route = createFileRoute('/_app')({
    component: RouteComponent,
    server: {
        middleware: [authMiddleware]
    }
})

function RouteComponent() {
    const { session } = Route.useRouteContext()
    return (
        <NavbarProvider>
            {session?.user && <AppNavbar intent='float' user={session?.user} />}
            <Container className='py-6 sm:py-12'>
                <Outlet />
            </Container>
        </NavbarProvider>
    )
}
