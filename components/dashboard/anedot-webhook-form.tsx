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
import { anedotWebhookSchema } from "@/lib/validations/anedotWebhook"
import { apiKeySchema } from "@/lib/validations/apiKey"
import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AutosaveSwitch } from "../autosave-switch"
import { Switch } from "../ui/switch"

interface AnedotWebhookFormProps extends React.HTMLAttributes<HTMLFormElement> {
  anedotWebhooks: any[]
}

type FormData = z.infer<typeof anedotWebhookSchema>

export function AnedotWebhookForm({
  anedotWebhooks,
  className,
  ...props
}: AnedotWebhookFormProps) {
  const router = useRouter()
  const [account_name, setAccountName] = React.useState<string>("")
  const [account_uid, setAccountUid] = React.useState<string>("")
  const [webhook_secret, setWebhookSecret] = React.useState<string>("")
  const [active, setActive] = React.useState<boolean>(false)
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(anedotWebhookSchema),
    defaultValues: {
      account_name: account_name,
      account_uid: account_uid,
      webhook_secret: webhook_secret,
      active: active,
    },
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [label, setLabel] = React.useState<string>("add webhook")

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    console.log(data)
    const response = await fetch(`/api/anedotWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_name: data.account_name,
        account_uid: data.account_uid,
        webhook_secret: data.webhook_secret,
        active: active,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: "Something went wrong.",
        description: "Your WebHook was not updated. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your WebHook has been updated.",
      type: "success",
    })

    router.refresh()
  }

  async function onDelete(webhookId: string) {
    setIsSaving(true)

    const response = await fetch(`/api/anedotWebhook/${webhookId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: "Something went wrong.",
        description: "Your WebHook was not deleted. Please try again.",
        variant: "destructive",
      })
    }

    toast({
      description: "Your WebHook has been deleted.",
      type: "success",
    })

    router.refresh()
  }

  console.log(anedotWebhooks)
  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Anedot Webhook</CardTitle>
          <CardDescription>
            Please enter your Webhook Information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={"font-white grid   gap-2"}>
            {anedotWebhooks.map((webhook) => (
              <div
                key={webhook.id}
                className={"grid-rows-auto grid grid-cols-5"}
              >
                <div>{webhook.account_name} </div>
                <div className="grow overflow-scroll ">
                  {webhook.account_uid}
                </div>
                <div className="grow overflow-scroll">
                  {webhook.webhook_secret}
                </div>
                <div className="shrink overflow-hidden px-4">
                  <AutosaveSwitch
                    label="Active"
                    initialValue={webhook?.active === true ? true : false}
                    fieldName="active"
                    method="PATCH"
                    route={`/api/anedotWebhook/${webhook.id}`}
                  />
                </div>
                <div className="shrink text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(webhook.id)}
                    className={cn(
                      "w-sm text-light mx-auto  rounded-full border border-transparent bg-red px-[20px] pb-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                      {
                        "cursor-not-allowed opacity-60": isSaving,
                      },
                      className
                    )}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Icons.spinner className="mr-2 inline h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.trash className="mr-2 inline h-4 w-4" />
                    )}
                    <span className="mx-auto">Delete</span>
                  </button>
                </div>
              </div>
            ))}
            <div className={"grid-rows-auto grid grid-cols-5 pt-4"}>
              <div className="grid gap-1">
                <label htmlFor="account_name">Account Name</label>
                <input
                  id="account_name"
                  className="my-0 mr-2 mb-2 block h-9  rounded-md border border-slate-300 py-2 px-3 text-sm text-slate-600 placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
                  {...register("account_name")}
                />
                {errors?.account_name && (
                  <p className="text-red-600 px-1 text-xs">
                    {errors.account_name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <label htmlFor="account_uid">Account UID</label>
                <input
                  id="account_uid"
                  className="my-0 mr-2 mb-2 block h-9  rounded-md border border-slate-300 py-2 px-3 text-sm text-slate-600 placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
                  {...register("account_uid")}
                />
                {errors?.account_uid && (
                  <p className="text-red-600 px-1 text-xs">
                    {errors.account_uid.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <label htmlFor="webhook_secret">Webhook Secret</label>
                <input
                  id="webhook_secret"
                  className="my-0 mr-2 mb-2 block h-9 rounded-md border border-slate-300 py-2 px-3 text-sm text-slate-600 placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
                  {...register("webhook_secret")}
                />
                {errors?.webhook_secret && (
                  <p className="text-red-600 px-1 text-xs">
                    {errors.webhook_secret.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <label htmlFor="active">Active</label>

                <Switch
                  className=""
                  checked={active}
                  onCheckedChange={() => setActive(!active)}
                  disabled={isSaving}
                />

                {errors?.active && (
                  <p className="text-red-600 px-1 text-xs">
                    {errors.active.message}
                  </p>
                )}
              </div>
              <div className={"pt-3"}>
                <button
                  type="submit"
                  className={cn(
                    "w-sm mx-auto  mt-4 rounded-full border border-transparent bg-accent-1 px-4 py-1 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                    {
                      "cursor-not-allowed opacity-60": isSaving,
                    },
                    className
                  )}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Icons.spinner className="mr-2 inline h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.add className="mr-2 inline h-4 w-4" />
                  )}
                  <span className="mx-auto">{label}</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="w-100 items-center text-center "></CardFooter>
      </Card>
    </form>
  )
}
