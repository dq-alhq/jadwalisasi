import type { Session } from 'better-auth'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import ErrorPage from '#/components/error-page'
import Providers from '#/components/provider'
import { Toast } from '#/components/ui/toast'
import { auth } from '#/lib/auth'
import appCss from '../styles.css?url'

interface RouterContext {
    session: Session | null
}

const fetchSession = createServerFn({ method: 'GET' }).handler(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({
        headers: request.headers
    })
    return session
})

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<RouterContext>()({
    beforeLoad: async () => {
        const session = await fetchSession()
        return {
            session
        }
    },
    head: () => ({
        meta: [
            {
                charSet: 'utf-8'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                title: 'TanStack Start Starter'
            }
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss
            }
        ]
    }),
    shellComponent: RootDocument,
    notFoundComponent: ErrorPage,
    errorComponent: ErrorPage
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <HeadContent />
            </head>
            <body className='wrap-anywhere font-sans antialiased'>
                <Providers>
                    {children}
                    <Toast />
                    <TanStackDevtools
                        config={{
                            position: 'bottom-right'
                        }}
                        plugins={[
                            {
                                name: 'Tanstack Router',
                                render: <TanStackRouterDevtoolsPanel />
                            }
                        ]}
                    />
                </Providers>
                <Scripts />
            </body>
        </html>
    )
}
