"use client"

import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import * as React from "react"

interface AnedotEventsProps {
  anedotEvents: any[]
}

export function AnedotEvents({ anedotEvents, ...props }: AnedotEventsProps) {
  const router = useRouter()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlSearchParams = new URLSearchParams(searchParams?.toString())

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [loadedEvents, setLoadedEvents] = React.useState<any[]>(anedotEvents)
  const [page, setPage] = React.useState<number>(
    searchParams?.get("page")
      ? parseInt(searchParams?.get("page") as string)
      : 0
  )
  const [showDetails, setShowDetails] = React.useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = React.useState<any>({})

  async function getEvents() {
    if (isLoading) {
      return
    }
    setIsLoading(true)

    console.log("client side sync")
    const response = await fetch("/api/anedot?skip=" + page * 25, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: "Debug 3.",
          description: "Your Mapping was not created.",
          variant: "success",
        })
      }

      return toast({
        title: "Debug 4.",
        description: "Your batch was not synced. Please try again.",
        variant: "success",
      })
    }

    console.log("invalidating cache")
    var data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    console.log(data)
    setTimeout(function () {
      console.log("Executed after 1 second")
      setIsLoading(false)
      console.log(response)
      setLoadedEvents(data)

      router.refresh()
    }, 400)
  }

  async function syncEvent(eventId, test) {
    console.log("sync event" + eventId)
    if (isLoading) {
      return
    }
    setIsLoading(true)
    console.log("sync event loading: " + isLoading)

    console.log("client side sync")
    const response = await fetch("/api/anedot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: eventId, test: test }),
    })
    if (!response?.ok) {
      setIsLoading(false)
      if (response.status === 404) {
        return toast({
          title: "Debug 3.",
          description: "Your Event as not Found.",
          variant: "success",
        })
      }

      return toast({
        title: "Debug 4.",
        description: "Your event was not synced. Please try again.",
        variant: "success",
      })
    }

    console.log("invalidating cache")
    var data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    console.log(data)
    setTimeout(function () {
      console.log("Executed after 1 second")
      setIsLoading(false)
      console.log(response)
      // setLoadedEvents(data)
      getEvents()
    }, 400)
  }

  function findAndSetEvent(eventId) {
    console.log(eventId)
    const foundEvent = loadedEvents.find((event) => event.id === eventId)
    console.log(foundEvent)
    foundEvent ? setSelectedEvent(foundEvent) : null
  }

  useEffect(() => {
    getEvents()
    setIsLoading(false)
    urlSearchParams.set("page", page.toString())
    const url = new URL(window.location.href)
    url.searchParams.set("page", page.toString())
    router.push(url.toString())

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="container grid w-screen grid-flow-row auto-rows-max grid-cols-12 items-center bg-dark px-4 lg:px-0">
      <div className="col-span-12 grid grid-cols-12">
        <div className="col-span-2">ID </div>
        <div> status</div>

        <div className=""> fund/project </div>
        <div className="">origin </div>
        <div className="col-span-3">
          {" "}
          <span>segment</span>
        </div>
        <div className="">Synced </div>
        <div className="">actions</div>
      </div>
      {loadedEvents.length > 0
        ? loadedEvents.map((event) => (
            <div key={event.id} className="col-span-12 grid grid-cols-12">
              <div className="col-span-2">{event.id} </div>
              <div className="">
                {event.status} {event.matchQuality}
              </div>
              <div className="">
                {event?.payload?.donation?.fund?.name ? (
                  <span className={event.projectMatch ? "" : "text-rose-500"}>
                    {event?.payload?.donation?.fund?.name}{" "}
                  </span>
                ) : (
                  <span className="text-rose-500">missing!</span>
                )}{" "}
              </div>
              <div className="">{event.payload?.origin}</div>
              <div className="col-span-3">
                <span className={event.segmentMatch ? "" : "text-rose-500"}>
                  {event.payload?.custom_field_responses?.segment_name ||
                    event.payload?.custom_field_responses?.campaign_segment ||
                    event.payload?.custom_field_responses?.campaign_segment_ ||
                    event.payload?.custom_field_responses?.campaign_source ||
                    ""}
                </span>
              </div>
              <div className="">{event.synced ? `synced` : `pending`} </div>
              <div className="">
                <Icons.refresh
                  className="inline h-4 w-4"
                  onClick={() => syncEvent(event.id, false)}
                />{" "}
                <Icons.testTube
                  className="inline h-4 w-4"
                  onClick={() => syncEvent(event.id, true)}
                />
                <button
                  data-modal-target="defaultModal"
                  data-modal-toggle="defaultModal"
                  className="m-1 inline rounded-lg bg-blue-700 px-1.5 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  type="button"
                  onClick={() => {
                    findAndSetEvent(event.id)
                    setShowDetails(true)
                  }}
                >
                  view
                </button>
              </div>
            </div>
          ))
        : `getting anedot events...`}
      <div className="col-span-12 grid grid-cols-2">
        <div
          className="pointer inline p-4"
          onClick={() => (page > -0 ? setPage(page - 1) : null)}
        >
          <Icons.chevronLeft className="inline" /> Previous{" "}
        </div>
        <div className="pointer inline p-4" onClick={() => setPage(page + 1)}>
          Next <Icons.chevronRight className="inline" />
        </div>
      </div>
      <div
        id="defaultModal"
        tabIndex={-1}
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 z-50 ${
          !showDetails ? "hidden" : null
        } col-span-12  h-[calc(100%-1rem)] max-h-full overflow-x-auto  overflow-y-scroll p-4 text-black md:inset-0`}
      >
        <div className="relative max-h-full w-full">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="flex items-start justify-between rounded-t border-b p-4 dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Event Details
              </h3>
              <button
                type="button"
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="defaultModal"
                onClick={() => setShowDetails(false)}
              >
                <svg
                  className="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="space-y-6 p-6">
              <h2>Event</h2>
              {JSON.stringify(selectedEvent?.payload)}
            </div>

            <div className="space-y-6 p-6">
              <h2>Generated Virtuous Query</h2>
              {JSON.stringify(selectedEvent?.virtuousQuery)}
            </div>

            <div className="items-right flex space-x-2 rounded-b border-t border-gray-200 p-6 text-right dark:border-gray-600">
              <button
                data-modal-hide="defaultModal"
                type="button"
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
