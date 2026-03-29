'use client'
import type { User } from 'better-auth'
import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Link } from '#/components/ui/link'
import {
    Navbar,
    NavbarGap,
    NavbarItem,
    NavbarMobile,
    type NavbarProps,
    NavbarSection,
    NavbarSeparator,
    NavbarSpacer,
    NavbarStart,
    NavbarTrigger,
    useNavbar
} from '#/components/ui/navbar'
import { Separator } from '#/components/ui/separator'
import { UserMenu } from '#/components/user-menu'
import { AppLogo } from './icons'
import ThemeToggle from './theme'

export default function AppNavbar(props: NavbarProps & { user: User }) {
    const { pathname } = useLocation()
    const { setOpen, open } = useNavbar()
    useEffect(() => {
        if (open) setOpen(false)
    }, [pathname])
    return (
        <>
            <Navbar {...props}>
                <NavbarStart>
                    <Link
                        aria-label='Goto documentation of Navbar'
                        className='flex items-center gap-x-2 font-medium'
                        href='/'
                    >
                        <AppLogo className='size-7' />
                        <span>
                            JADWAL<span className='text-muted-fg'>ISASI</span>
                        </span>
                    </Link>
                </NavbarStart>
                <NavbarGap />
                <NavbarSection>
                    <NavbarItem href='/' isCurrent={pathname === '/'}>
                        Home
                    </NavbarItem>
                    {props.user.name === 'Administrator' && (
                        <NavbarItem href='/import' isCurrent={pathname.startsWith('/import')}>
                            Import Jadwal
                        </NavbarItem>
                    )}
                    <NavbarItem href='/edit' isCurrent={pathname.startsWith('/edit')}>
                        Ubah Jadwal
                    </NavbarItem>
                </NavbarSection>
                <NavbarSpacer />
                <NavbarSection className='max-md:hidden'>
                    <ThemeToggle />
                    <Separator className='mr-3 ml-1 h-5' orientation='vertical' />
                    <UserMenu user={props.user} />
                </NavbarSection>
            </Navbar>
            <NavbarMobile>
                <NavbarTrigger />
                <NavbarSpacer />
                <ThemeToggle />
                <NavbarSeparator className='mr-2.5' />
                <UserMenu user={props.user} />
            </NavbarMobile>
        </>
    )
}
