import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import ErrorPage from './components/error-page'
import { routeTree } from './routeTree.gen'

export function getRouter() {
    const router = createTanStackRouter({
        routeTree,
        context: {
            session: null
        },
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
        defaultErrorComponent: ErrorPage,
        defaultNotFoundComponent: ErrorPage,
        defaultViewTransition: true
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
