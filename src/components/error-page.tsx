import { ArrowLeftIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Link, useRouter } from '@tanstack/react-router'
import { Button, buttonStyles } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function ErrorPage() {
    const router = useRouter()

    return (
        <div className='flex h-dvh items-center justify-center bg-linear-to-br from-bg to-secondary p-4'>
            <Card className='w-full max-w-2xl animate-fade-in shadow-2xl'>
                <CardContent className='p-4 text-center'>
                    {/* Animated 404 Text */}
                    <div className='mb-8'>
                        <h1 className='animate-pulse bg-linear-to-r from-danger to-primary bg-clip-text font-extrabold text-8xl text-transparent'>
                            404
                        </h1>
                    </div>

                    {/* Animated Icon */}
                    <div className='mb-6 flex animate-wiggle justify-center'>
                        <div className='relative'>
                            <MagnifyingGlassIcon className='size-24 animate-spin-slow text-muted-fg' />
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <div className='h-3 w-3 animate-ping rounded-full bg-danger'></div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='mb-8 animate-slide-up space-y-4'>
                        <h2 className='font-bold text-lg text-muted-fg lg:text-3xl'>Halaman Tidak Ditemukan</h2>
                        <p className='mx-auto max-w-md text-base text-muted-fg lg:text-lg'>
                            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah
                            dipindahkan atau tidak pernah ada.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex animate-fade-in-delay items-center justify-center gap-4'>
                        <Button
                            className='cursor-pointer duration-200 hover:scale-105'
                            onClick={() => router.history.back()}
                            size='lg'
                        >
                            <ArrowLeftIcon className='size-5' />
                            Kembali
                        </Button>

                        <Link
                            className={buttonStyles({
                                size: 'lg',
                                intent: 'outline',
                                className: 'duration-200 hover:scale-105'
                            })}
                            to='/'
                        >
                            <HomeIcon className='size-5' />
                            Ke Beranda
                        </Link>
                    </div>

                    {/* Decorative Elements */}
                    <div className='mt-12 flex justify-center gap-2'>
                        {[...Array(5)].map((_, i) => (
                            <div
                                className='h-2 w-2 animate-bounce rounded-full bg-blue-500'
                                key={i}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }

        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    )
}
