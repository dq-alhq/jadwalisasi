import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Button } from '#/components/ui/button'

type ThemeMode = 'light' | 'dark' | 'auto'

export function getInitialMode(): ThemeMode {
    if (typeof window === 'undefined') {
        return 'auto'
    }

    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored
    }

    return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    if (mode === 'auto') {
        document.documentElement.removeAttribute('data-theme')
    } else {
        document.documentElement.setAttribute('data-theme', mode)
    }

    document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
    const [mode, setMode] = useState<ThemeMode>('auto')

    useEffect(() => {
        const initialMode = getInitialMode()
        setMode(initialMode)
        applyThemeMode(initialMode)
    }, [])

    useEffect(() => {
        if (mode !== 'auto') {
            return
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => applyThemeMode('auto')

        media.addEventListener('change', onChange)
        return () => {
            media.removeEventListener('change', onChange)
        }
    }, [mode])

    function toggleMode() {
        const nextMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
        setMode(nextMode)
        applyThemeMode(nextMode)
        window.localStorage.setItem('theme', nextMode)
    }

    return (
        <Button
            aria-label={`Switch to ${mode}` === 'light' ? 'dark' : 'light' + 'mode'}
            intent='plain'
            onPress={toggleMode}
            size='sq-md'
        >
            {mode === 'auto' ? (
                <ComputerDesktopIcon
                    aria-hidden
                    className='absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
                />
            ) : (
                <>
                    <SunIcon
                        aria-hidden
                        className='absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
                    />
                    <MoonIcon
                        aria-hidden
                        className='absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
                    />
                </>
            )}
        </Button>
    )
}
