import type { User } from 'better-auth'
import { ArrowRightStartOnRectangleIcon, Cog6ToothIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useRouter } from '@tanstack/react-router'
import { Avatar } from '#/components/ui/avatar'
import { Menu, MenuContent, MenuHeader, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from '#/components/ui/menu'
import { signOut } from '#/lib/auth-client'

export function UserMenu({ user }: { user: User }) {
    const { navigate } = useRouter()

    const handleSignOut = async () => {
        await signOut()
        navigate({ to: '/login' })
    }
    return (
        <Menu>
            <MenuTrigger aria-label='Open Menu'>
                <Avatar alt='cobain' initials={user.name.charAt(0)} isSquare size='md' src={user.image} />
            </MenuTrigger>
            <MenuContent className='min-w-60 sm:min-w-56' placement='bottom right'>
                <MenuSection>
                    <MenuHeader separator>
                        <span className='block'>{user.name}</span>
                        <span className='font-normal text-muted-fg'>{user.email}</span>
                    </MenuHeader>
                </MenuSection>

                {user.name === 'Administrator' && (
                    <>
                        <MenuItem href='/dashboard'>
                            <UsersIcon />
                            User Management
                        </MenuItem>
                        <MenuItem href='/settings'>
                            <Cog6ToothIcon />
                            Settings
                        </MenuItem>
                        <MenuSeparator />
                    </>
                )}
                <MenuItem intent='danger' onAction={handleSignOut}>
                    <ArrowRightStartOnRectangleIcon />
                    Log out
                </MenuItem>
            </MenuContent>
        </Menu>
    )
}
