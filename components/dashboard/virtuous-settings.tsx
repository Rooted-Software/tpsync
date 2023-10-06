"use client"

import { Icons } from "@/components/icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { apiKeySchema } from "@/lib/validations/apiKey"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface VirtuousSettingsFormProps
  extends React.HTMLAttributes<HTMLFormElement> {
  apiKey?: string
}

type FormData = z.infer<typeof apiKeySchema>

export function VirtuousSettingsForm({
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
  const [label, setLabel] = React.useState<string>("Save")
  async function onSubmit(data: FormData) {
    setIsSaving(true)
    console.log(data)
    const response = await fetch(`/api/virSettings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: data.apiKey,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: "Something went wrong.",
        description: "Your APIKey was not updated. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your apiKey has been updated.",
      type: "success",
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
        <CardHeader>
          <CardTitle>Virtuous API Key</CardTitle>
          <CardDescription>Please enter your virtuous Api Key.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-left">
            <div className="col-span-2">
              <label className="sr-only" htmlFor="name">
                Virtuous API Key
              </label>
              <input
                id="apiKey"
                className="my-0 mb-2 block h-9 w-full rounded-md border border-slate-300 py-2 px-3 text-sm text-slate-600 placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
                {...register("apiKey")}
              />
              {errors?.apiKey && (
                <p className="text-red-600 px-1 text-xs">
                  {errors.apiKey.message}
                </p>
              )}
            </div>
            <div className={" "}>
              <button
                type="submit"
                className={cn(
                  "w-sm h-9 rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                  {
                    "cursor-not-allowed opacity-60": isSaving,
                  },
                  className
                )}
                disabled={isSaving}
              >
                {isSaving && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                <span className="mx-auto">{label}</span>
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="w-100 inline items-center "></CardFooter>
      </Card>
    </form>
  )
}
