'use client'
import styles from './grid.module.css'
import { useState, useEffect } from 'react'

import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useSearchParams } from 'next/navigation'


interface AnedotEventsProps {
  anedotEvents: any[]

}




export function AnedotEvents({
    anedotEvents,
  ...props
}: AnedotEventsProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loadedEvents, setLoadedEvents] = React.useState<any[]>(anedotEvents)
  const [page, setPage] = React.useState<number>(0)


  async function getEvents() {

    if (isLoading) { return }
    setIsLoading(true);


    console.log('client side sync')
    const response = await fetch('/api/anedot?skip=' + (page*25), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Debug 3.',
          description: 'Your Mapping was not created.',
          variant: 'success',
        })
      }

      return toast({
        title: 'Debug 4.',
        description: 'Your batch was not synced. Please try again.',
        variant: 'success',
      })
    }

    console.log('invalidating cache')
    var data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :) 
    console.log(data)
    setTimeout(function(){
      console.log("Executed after 1 second");
      setIsLoading(false)
      console.log(response)
      setLoadedEvents(data)
      
    router.refresh()
  }, 400);
    
  }

  async function syncEvent(eventId, test) {
    console.log('sync event' + eventId)
    if (isLoading) { return }
    setIsLoading(true);
    console.log('sync event loading: ' + isLoading)

    console.log('client side sync')
    const response = await fetch('/api/anedot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: eventId, test: test}),
    })
    if (!response?.ok) {
      setIsLoading(false)
      if (response.status === 404) {
        return toast({
          title: 'Debug 3.',
          description: 'Your Event as not Found.',
          variant: 'success',
        })
      }

      return toast({
        title: 'Debug 4.',
        description: 'Your event was not synced. Please try again.',
        variant: 'success',
      })
    }

    console.log('invalidating cache')
    var data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :) 
    console.log(data)
    setTimeout(function(){
      console.log("Executed after 1 second");
      setIsLoading(false)
      console.log(response)
      // setLoadedEvents(data)
      getEvents()

  }, 400);
    
  }

   

  useEffect(() => {
    getEvents()
    setIsLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])


  return (<>
    {loadedEvents.length >0 ? (
        loadedEvents.map((event) => 
           <>
             <div key={event.id} className='pl-4 '>{event.id} : | {event.status} : {event.matchQuality} {event?.payload?.donation?.fund?.name ? <span className={event.projectMatch ? '' : 'text-rose-500' }>{event?.payload?.donation?.fund?.name} </span> : <span className="text-rose-500">missing!</span>} </div><div>{event.payload?.origin} <span className={event.segmentMatch ? '' : 'text-rose-500'} >{event.payload?.custom_field_responses?.segment_name || event.payload?.custom_field_responses?.campaign_segment || event.payload?.custom_field_responses?.campaign_segment_  || event.payload?.custom_field_responses?.campaign_source || ''}</span></div><div>{event.synced ? `synced`: `pending`} <Icons.refresh className="inline h-4 w-4" onClick={()=>syncEvent(event.id, false )} /> <Icons.testTube className="inline h-4 w-4" onClick={()=>syncEvent(event.id, true )} /> </div>
           </>)
        ) : `getting anedot events...`}

        <h3 className='p-4'>More <Icons.chevronRight className='inline'  onClick={()=>setPage(page+1)} /></h3>
    </>
  )
}
