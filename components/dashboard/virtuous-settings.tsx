'use client'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { apiKeySchema } from '@/lib/validations/apiKey'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { apiSettings } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

interface VirtuousSettingsFormProps
  extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, 'id' | 'name'>
  apiKey: string
}

type FormData = z.infer<typeof apiKeySchema>

export function VirtuousSettingsForm({
  user,
  apiKey,
  className,
  ...props
}: VirtuousSettingsFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: apiKey,
    },
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    console.log(data)
    const response = await fetch(`/api/virtuousSettings/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: data.apiKey,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: 'Something went wrong.',
        description: 'Your APIKey was not updated. Please try again.',
        variant: 'destructive',
      })
    }

    toast({
      description: 'Your apiKey has been updated.',
      type: 'success',
    })

    router.refresh()
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <Card.Header>
          <Card.Title>Virtuous API Key</Card.Title>
          <Card.Description>
            Please enter your virtuous Api Key.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid gap-1">
            <label className="sr-only" htmlFor="name">
              Virtuous API Key
            </label>
            <input
              id="apiKey"
              className="my-0 mb-2 block h-9 w-[350px] rounded-md border border-slate-300 py-2 px-3 text-sm placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              name="apiKey"
              {...register('apiKey')}
            />
            {errors?.apiKey && (
              <p className="px-1 text-xs text-red-600">
                {errors.apiKey.message}
              </p>
            )}
          </div>
        </Card.Content>
        <Card.Footer>
          <button
            type="submit"
            className={cn(
              'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
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
            <span>Save</span>
          </button>
        </Card.Footer>
      </Card>
    </form>
  )
}
