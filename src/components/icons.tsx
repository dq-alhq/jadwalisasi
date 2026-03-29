import type { SVGProps } from 'react'

export const AppLogo = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...props} viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
            <g fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5}>
                <path d='M22.924 13.323v4.752a.84.84 0 0 1-.84.84H1.916a.84.84 0 0 1-.84-.84V4.631a.84.84 0 0 1 .84-.84H5.73m4.59 15.125l-1.68 4.201m5.04-4.201l1.681 4.201m-8.402 0h10.083'></path>
                <path d='M14.455 1.004h.94a.94.94 0 0 1 .942.94v2.581a3.764 3.764 0 0 1-7.528 0v-2.58a.94.94 0 0 1 .941-.941h.941m10.351 5.403a1.882 1.882 0 1 0 0-3.764a1.882 1.882 0 0 0 0 3.764'></path>
                <path d='M12.573 8.29v.47a4.235 4.235 0 0 0 8.468 0V6.407'></path>
            </g>
        </svg>
    )
}

export const MaleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M216 28h-48a12 12 0 0 0 0 24h19l-32.72 32.74a84 84 0 1 0 17 17L204 69v19a12 12 0 0 0 24 0V40a12 12 0 0 0-12-12m-69.59 166.46a60 60 0 1 1 0-84.87a60.1 60.1 0 0 1 0 84.87'
            fill='currentColor'
        />
    </svg>
)

export const FemaleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M212 96a84 84 0 1 0-96 83.13V196H88a12 12 0 0 0 0 24h28v20a12 12 0 0 0 24 0v-20h28a12 12 0 0 0 0-24h-28v-16.87A84.12 84.12 0 0 0 212 96M68 96a60 60 0 1 1 60 60a60.07 60.07 0 0 1-60-60'
            fill='currentColor'
        />
    </svg>
)

export const ExcelIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M15.534 1.36L14.309 0H4.662c-.696 0-.965.516-.965.919v3.63H5.05V1.653c0-.154.13-.284.28-.284h6.903c.152 0 .228.027.228.152v4.82h4.913c.193 0 .268.1.268.246v11.77c0 .246-.1.283-.25.283H5.33a.287.287 0 0 1-.28-.284V17.28H3.706v1.695c-.018.6.302 1.025.956 1.025H18.06c.7 0 .939-.507.939-.969V5.187l-.35-.38zm-1.698.16l.387.434l2.596 2.853l.143.173h-2.653q-.3 0-.38-.1q-.08-.098-.093-.313zm-1.09 9.147h4.577v1.334h-4.578zm0-2.666h4.577v1.333h-4.578zm0 5.333h4.577v1.334h-4.578zM1 5.626v10.667h10.465V5.626zm5.233 6.204l-.64.978h.64V14H3.016l2.334-3.51l-2.068-3.156H5.01L6.234 9.17l1.223-1.836h1.727L7.112 10.49L9.449 14H7.656z'
            fill='currentColor'
        ></path>
    </svg>
)
