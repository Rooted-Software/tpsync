'use client'

import { Icons } from '@/components/icons'
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { FeSetting } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'

interface REFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, 'id' | 'name'>
  reAuthorizeURL: string
  reData: Pick<
    FeSetting,
    'id' | 'environment_name' | 'legal_entity_id' | 'email' | 'expires_in'
  >
}

export function RESetupForm({
  user,
  reAuthorizeURL,
  reData,
  className,
  ...props
}: REFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  console.log('in RE FORm')
  console.log(reData)
  const [reDataFromProps, setReDataFromProps] = React.useState(reData)

  React.useEffect(() => {
    setReDataFromProps(reData)
  }, [reData])

  async function onSubmit() {
    setIsSaving(true)

    if (!reData?.id) {
      const popup = window.open(
        reAuthorizeURL,
        'login',
        'height=450,width=600,'
      )
      //chaged from window.focus
      if (document.hasFocus()) {
        popup?.focus()
      }
      /*
      const response = await fetch(`/api/reSettings/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: data.apiKey,
        }),
      })
      */
      setIsSaving(false)
      router.refresh()
    } else {
      const response = await fetch(`/api/reSettings`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'delete',
        }),
      })
      console.log('response status: ', response.status)
      console.log(response)
      if (response.ok) {
        setIsSaving(false)
        setReDataFromProps(null)
        router.refresh()
      } else {
        setIsSaving(false)
        router.refresh()
      }
    }
  }
  
  return (
    <form className={cn(className)} onSubmit={() => onSubmit()} {...props}>
      
          {!reData?.id ? (
            <button
              type="submit"
              className={cn(
                'relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                {
                  'cursor-not-allowed opacity-60': isSaving,
                },
                className
              )}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span> {reData?.id
              ? `Re-configure Financial Edge`
              : `Connect to Financial Edge`}</span>
            </button>
          ) : (<>
            <button
              type="submit"
              className={cn(
                'hover:bg- relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                {
                  'cursor-not-allowed opacity-60': isSaving,
                },
                className
              )}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Disconnect/Reconfigure FE</span>
            </button>
            <Link href="/step3">

            <button
            type="submit"
            className={cn(
              'hover:bg- relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              {
                'cursor-not-allowed opacity-60': isSaving,
              },
              className
            )}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <span>Continue to Data Mapping</span>
          </button></Link>
          </>
          )}
    </form>
  )
}
