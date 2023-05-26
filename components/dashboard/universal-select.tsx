"use client"

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { any } from 'prop-types'
import * as React from 'react'

interface UniversalButtonProps {
    title: String,
    route: RequestInfo,
    method: String,
    fields: string[],
    redirect: string,

  }

export function UniversalSelect({
  title, 
  route, 
  method,
  fields,
  redirect, 
  ...props
}: UniversalButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [returnedData , setReturnedData] = React.useState(Array<{any}>)
  const [selectValue, setSelectValue] = React.useState('')

  async function getInitialData() {
    console.log('getInitialData')
    if (isLoading) {return}
    setIsLoading(true)
    setReturnedData([])
    const response = await fetch(route, {
      method: 'GET',
    })

    setIsLoading(false)
    console.log(response)
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()
    console.log(data)
    if (data?.length > 0) {
      setReturnedData(data)
    }
    // This forces a cache invalidation.
    router.refresh()
  }

  async function saveSelectedData() {
    console.log('getInitialData')
    if (isLoading) {return}
    setIsLoading(true)

    const bodyJson = JSON.stringify({
        route: route,
        selectValue: selectValue,
      })
      console.log(bodyJson)

    const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyJson,
    })

    setIsLoading(false)
    console.log(response)
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }
     window.location.href = redirect
  }

  if ( returnedData?.length < 1 && !isLoading) { 
        const user =  getInitialData()
  }
  return (
    <div className='w-100'>
      
      {returnedData && returnedData.length > 0 ? (
        <div className='w-100'>
            <label htmlFor="journals" className="sr-only">Select an option</label>
<select id="journals" onChange={(e)=> {setSelectValue(e.target.value); console.log(e.target.value)}} className="text-md m-5 block w-full rounded-full border border-accent-1 bg-accent-1 py-2 px-5 text-dark focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
{returnedData?.map((item :any, index) => (
            <option key={'option' + index} value={item[fields[0]]} className="mt-2">
              {fields?.map((field :any, index) => <> {item[field]} </>)}
            </option>
          ))}
</select>
            
<button
        onClick={saveSelectedData}
        className={cn(
          'font-large relative inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke  py-1  px-5 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          }
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          null
        )}
        { title }
      </button>
        </div>
      ) : null}
    </div>
  )
}
