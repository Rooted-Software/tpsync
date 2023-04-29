'use client'

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { virtuousAuthSchema } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

interface UserVirtuousAuthFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  csrfToken: string
}

type FormData = z.infer<typeof virtuousAuthSchema>

export function UserVirtuousAuthForm({
  csrfToken,
  className,
  ...props
}: UserVirtuousAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(virtuousAuthSchema),
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const searchParams = useSearchParams()

  const [error, setError] = useState(null)

  async function onSubmit(data: FormData) {
    setIsLoading(true)

    const signInResult = await signIn('virtuous', {
      email: data.email.toLowerCase(),
      redirect: false,
      password: data.password,
      callbackUrl: searchParams.get('from') || '/dashboard',
    })
    console.log(signInResult)
    setIsLoading(false)

    if (!signInResult?.ok) {
      return toast({
        title: 'Something went wrong.',
        description: 'Your sign in request failed. Please try again.',
        type: 'error',
      })
    }
    window.location.href = signInResult.url
    return toast({
      title: 'Success!',
      description: 'You have successfully signed in.',
      variant: 'destructive',
    })
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              placeholder="name@example.com"
              className="my-0 mb-2 block h-9 w-full rounded-md border border-slate-300 py-2 px-3 text-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              name="email"
              disabled={isLoading}
              {...register('email')}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              placeholder="xyazb1Cfna"
              className="my-0 mb-2 block h-9 w-full rounded-md border border-slate-300 py-2 px-3 text-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              name="password"
              disabled={isLoading}
              {...register('password')}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 disabled:opacity-50 dark:hover:bg-[#050708]/30 dark:focus:ring-slate-500"
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Virtuous
          </button>
        </div>
      </form>
    </div>
  )
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}
