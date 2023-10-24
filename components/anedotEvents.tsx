"use client"

import { Icons } from "@/components/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { set } from "date-fns"
import { create } from "domain"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import * as React from "react"
import { Calendar } from "./ui/calendar"
import { DatePicker } from "./ui/datePicker"

interface AnedotEventsProps {
  anedotEvents: any[]
  eventCount: number
}
var replacements = { "\\\\": "\\", "\\n": "\n", '\\"': '"' }

function slashUnescape(contents) {
  return contents.replace(/\\(\\|n|")/g, function (replace) {
    return replacements[replace]
  })
}

export function AnedotEvents({
  anedotEvents,
  eventCount,
  ...props
}: AnedotEventsProps) {
  const router = useRouter()

  const pathname = usePathname() || "/"
  const searchParams = useSearchParams()
  const urlSearchParams = new URLSearchParams(searchParams?.toString())
  const [idType, setIdType] = React.useState<string>(
    searchParams?.get("webhookId") ? "webhookId" : "donationId"
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [loadedEvents, setLoadedEvents] = React.useState<any[]>(anedotEvents)
  const [idFilter, setIdFilter] = React.useState<string>(
    idType === "donationId"
      ? searchParams?.get("donationId") || ""
      : searchParams?.get("webhookId") || ""
  )
  const [matchFilter, setMatchFilter] = React.useState<string>(
    searchParams?.get("matchQuality") || ""
  )
  const [fundFilter, setFundFilter] = React.useState<string>(
    searchParams?.get("fund") || ""
  )
  const [originFilter, setOriginFilter] = React.useState<string>(
    searchParams?.get("origin") || ""
  )
  const [segmentFilter, setSegmentFilter] = React.useState<string>(
    searchParams?.get("segment") || ""
  )
  const [contactFilter, setContactFilter] = React.useState<string>(
    searchParams?.get("virtuousContact") || ""
  )

  const [eventFilter, setEventFilter] = React.useState<string>(
    searchParams?.get("event") || ""
  )
  const [createdAtFilter, setCreatedAtFilter] = React.useState<string>(
    searchParams?.get("createdAt") || ""
  )
  const [syncedFilter, setSyncedFilter] = React.useState<string>(
    searchParams?.get("synced") || ""
  )
  const [statusFilter, setStatusFilter] = React.useState<string>(
    searchParams?.get("status") || ""
  )
  const [orderField, setOrderField] = React.useState<string>(
    searchParams?.get("orderField") || "createdAt"
  )
  const [orderDirection, setOrderDirection] = React.useState<string>(
    searchParams?.get("orderDirection") || "desc"
  )
  const [page, setPage] = React.useState<number>(
    searchParams?.get("page")
      ? parseInt(searchParams?.get("page") as string)
      : 0
  )
  const [showDetails, setShowDetails] = React.useState<boolean>(false)
  const [selectedEvent, setSelectedEvent] = React.useState<any>({})

  useEffect(() => {
    console.log("useEffect")
    let url = new URL(window.location.href)
    let urlString = url.toString()
    let newUrl = setSearchParams(url)
    console.log(newUrl.toString())

    if (!isLoading && url.toString() !== urlString) {
      window.location.href = newUrl.toString()
    }
    setIsLoading(false)
  }, [
    page,
    orderField,
    orderDirection,
    idFilter,
    idType,
    statusFilter,
    originFilter,
    syncedFilter,
    createdAtFilter,
    matchFilter,
  ])

  async function getEvents() {
    if (isLoading) {
      return
    }
    setIsLoading(true)

    console.log("client side sync")
    const response = await fetch(
      "/api/anedot?skip=" +
        page * 25 +
        "&sort=created_at&sortOrder=desc&filterStatus=pending",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
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
    let data = await response.json()
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
    const response = await fetch("/api/anedot", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: eventId, test: test }),
    })
    if (!(response?.status === 200)) {
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
    toast({
      title: "Success.",
      description: `Your event was ${test ? "tested" : "synced"}.`,
      variant: "success",
    })
    console.log("invalidating cache")
    let data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    console.log(data)
    setTimeout(function () {
      console.log("Executed after 1 second")
      setIsLoading(false)
      console.log(response)
      let url = new URL(window.location.href)

      router.refresh()

      window.location.href = url.toString()

      // setLoadedEvents(data)
      // getEvents()
    }, 400)
  }

  async function syncAllEvents(test) {
    console.log("sync all events " + test)
    if (isLoading) {
      return
    }
    setIsLoading(true)
    console.log("sync event loading: " + isLoading)
    // build body object from filter and order

    let body = {
      donationId: idType === "donationId" ? idFilter : "",
      webhookId: idType === "webhookId" ? idFilter : "",
      matchQuality: matchFilter,
      fund: fundFilter,
      origin: originFilter,
      segment: segmentFilter,
      virtuousContact: contactFilter,
      event: eventFilter,
      createdAt: createdAtFilter,
      synced: syncedFilter,
      status: statusFilter,
      orderField: orderField,
      orderDirection: orderDirection,
      page: page,
      test: test,
    }

    console.log("client side sync")
    const response = await fetch("/api/anedot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    if (!(response?.status === 200)) {
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
    let data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    console.log(data)
    setTimeout(function () {
      console.log("Executed after 1 second")
      setIsLoading(false)
      console.log(response)
      // setLoadedEvents(data)
      toast({
        title: "Success",
        description: "Events Synced",
        variant: "success",
      })

      let url = new URL(window.location.href)

      router.refresh()

      window.location.href = url.toString()
      // getEvents()
    }, 400)
  }

  function findAndSetEvent(eventId) {
    console.log(eventId)
    const foundEvent = loadedEvents.find((event) => event.id === eventId)
    console.log(foundEvent)
    foundEvent ? setSelectedEvent(foundEvent) : null
  }

  function setFilterAndSort(pathname) {
    setPage(0)
    let url = new URL(pathname, window.location.origin)
    url = setSearchParams(url)

    router.push(url.toString())
    router.refresh()
    window.location.href = url.toString()
  }

  function clearFilterAndSort(pathname) {
    let url = new URL(pathname, window.location.origin)
    setIdFilter("")
    setMatchFilter("")
    setFundFilter("")
    setOriginFilter("")
    setSegmentFilter("")
    setContactFilter("")
    setEventFilter("")
    setCreatedAtFilter("")
    setSyncedFilter("")
    setStatusFilter("")

    setPage(0)
    setTimeout(function () {
      console.log("Executed after 1 second")

      window.location.href = url.toString()
    }, 400)
  }

  function setSearchParams(url) {
    if (idFilter) {
      if (idType === "donationId") {
        url.searchParams.set("donationId", idFilter.trim())
        url.searchParams.delete("webhookId")
      } else {
        url.searchParams.set("webhookId", idFilter.trim())
        url.searchParams.delete("donationId")
      }
    } else {
      url.searchParams.delete("webhookId")
      url.searchParams.delete("donationId")
    }
    if (matchFilter) {
      url.searchParams.set("matchQuality", matchFilter)
    } else {
      url.searchParams.delete("matchQuality")
    }
    if (fundFilter && fundFilter !== "") {
      console.log(fundFilter)
      url.searchParams.set("fund", fundFilter.trim())
    } else {
      url.searchParams.delete("fund")
    }

    if (originFilter) {
      url.searchParams.set("origin", originFilter)
    } else {
      url.searchParams.delete("origin")
    }
    if (segmentFilter) {
      url.searchParams.set("segment", segmentFilter.trim())
    } else {
      url.searchParams.delete("segment")
    }

    if (contactFilter) {
      url.searchParams.set("virtuousContact", contactFilter.trim())
    } else {
      url.searchParams.delete("virtuousContact")
    }
    if (eventFilter) {
      url.searchParams.set("event", eventFilter)
    } else {
      url.searchParams.delete("event")
    }

    if (createdAtFilter) {
      url.searchParams.set("createdAt", createdAtFilter)
    } else {
      url.searchParams.delete("createdAt")
    }

    if (syncedFilter) {
      url.searchParams.set("synced", syncedFilter)
    } else {
      url.searchParams.delete("synced")
    }

    if (statusFilter) {
      url.searchParams.set("status", statusFilter)
    } else {
      url.searchParams.delete("status")
    }

    url.searchParams.set("orderField", orderField)
    url.searchParams.set("orderDirection", orderDirection)
    url.searchParams.set("page", page.toString())

    return url
  }

  return (
    <div
      className={`m-0 grid w-[95%] p-0 ${
        isLoading ? `cursor-wait` : null
      } mx-auto grid-flow-row auto-rows-max grid-cols-12 items-center bg-dark lg:px-0`}
    >
      <div className="col-span-12 grid w-[100%] grid-cols-12 rounded-md bg-slate-700 px-2 pt-2 pb-4">
        <div className="col-span-2">
          &nbsp;
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="mx-2 w-[150px] text-left">{idType}</div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setIdType("donationId")
                }}
              >
                &nbsp; Donation
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setIdType("webhookId")
                }}
              >
                &nbsp; Webhook{" "}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            className={"mx-2 rounded-md bg-white p-1 text-black"}
            value={idFilter}
            onChange={(e) => {
              setIdFilter(e.target.value)
            }}
          />
        </div>
        <div className="">
          {"status "}
          <br />
          <span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={"w-sm w-[100px] rounded-md bg-white p-1 text-black"}
              >
                {statusFilter === "" ? `` : `${statusFilter} `}&nbsp;
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setStatusFilter("created")
                  }}
                >
                  created
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setStatusFilter("tested")
                  }}
                >
                  tested
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setStatusFilter("success")
                  }}
                >
                  success
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setStatusFilter("error")
                  }}
                >
                  error
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setStatusFilter("")
                  }}
                >
                  all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>
        <div>
          match <br />
          <span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={"w-sm w-[100px] rounded-md bg-white p-1 text-black"}
              >
                {matchFilter === "" ? "" : `Match ${matchFilter} `}&nbsp;
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setMatchFilter("1")
                  }}
                >
                  1
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setMatchFilter("2")
                  }}
                >
                  2
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setMatchFilter("3")
                  }}
                >
                  3
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setMatchFilter("4")
                  }}
                >
                  4
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(event) => {
                    setMatchFilter("")
                  }}
                >
                  Any
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </div>
        <div className="">
          <span className="px-2">fund </span>
          <br />
          <input
            className={"mx-2 w-24 rounded-md bg-white p-1 text-black"}
            value={fundFilter}
            onChange={(e) => {
              setFundFilter(e.target.value)
            }}
          />
        </div>
        <div className="">
          origin
          <br />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={"w-sm w-[100px] rounded-md bg-white p-1 text-black"}
            >
              {originFilter === "" ? ` ` : `${originFilter}`} &nbsp;
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setOriginFilter("hosted")
                }}
              >
                hosted
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setOriginFilter("recurring")
                }}
              >
                recurring
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setOriginFilter("")
                }}
              >
                all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="col-span-2">
          <span className="mx-2">segment</span>
          <br />
          <span>
            <input
              className={"mx-2  rounded-md bg-white p-1 text-black"}
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value)
              }}
            />
          </span>
        </div>
        <div>
          <span className="mx-2">contact</span> <br />
          <input
            className={"mx-2 w-24 rounded-md bg-white p-1 text-black"}
            value={contactFilter}
            onChange={(e) => {
              setContactFilter(e.target.value)
            }}
          />
        </div>
        <div className="">
          <span className="mx-2">synced</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={"w-sm w-[100px] rounded-md bg-white p-1 text-black"}
            >
              {syncedFilter === "" ? ` ` : `${syncedFilter}`}&nbsp;
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setSyncedFilter("false")
                }}
              >
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setSyncedFilter("true")
                }}
              >
                Synced
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(event) => {
                  setSyncedFilter("")
                }}
              >
                all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="">
          created
          <DatePicker
            setDateFunction={setCreatedAtFilter}
            initialDate={createdAtFilter}
          />
        </div>
        <div className="pointer pt-5">
          {" "}
          <button
            onClick={() => setFilterAndSort(pathname)}
            className="m-1 inline rounded-lg bg-blue-700 px-1.5 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            set filters
          </button>
          <button
            onClick={() => clearFilterAndSort(pathname)}
            className="m-1 inline rounded-lg bg-blue-400 px-1.5 py-1 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
          >
            clear all
          </button>
        </div>
      </div>
      <div className="col-span-12 my-2 grid grid-cols-12 rounded-md bg-slate-900 p-2">
        <div className="col-span-2">{idType} </div>
        <div>
          {" "}
          <span
            className={"cursor-pointer"}
            onClick={() => {
              setOrderField("status")
              setOrderDirection(orderDirection === "asc" ? "desc" : "asc")
            }}
          >
            status{" "}
          </span>
          {orderField === "status" ? (
            <span>
              {orderDirection === "asc" ? (
                <Icons.arrowUp className="mr-2 inline h-4 w-4" />
              ) : (
                <Icons.arrowDown className="mr-2 inline h-4 w-4" />
              )}
            </span>
          ) : null}{" "}
        </div>
        <div>
          {" "}
          <span
            className={"cursor-pointer"}
            onClick={() => {
              setOrderField("matchQuality")
              setOrderDirection(orderDirection === "asc" ? "desc" : "asc")
            }}
          >
            match{" "}
          </span>
          {orderField === "matchQuality" ? (
            <span>
              {orderDirection === "asc" ? (
                <Icons.arrowUp className="mr-2 inline h-4 w-4" />
              ) : (
                <Icons.arrowDown className="mr-2 inline h-4 w-4" />
              )}
            </span>
          ) : null}{" "}
        </div>

        <div className=""> fund/project </div>
        <div className="">origin </div>
        <div className="col-span-2">
          {" "}
          <span>segment</span>
        </div>
        <div>contact</div>
        <div className="">Synced </div>
        <div className=" cursor-pointer">
          <span
            onClick={() => {
              setOrderField("createdAt")
              setOrderDirection(orderDirection === "asc" ? "desc" : "asc")
            }}
          >
            created{" "}
          </span>
          {orderField === "createdAt" ? (
            <span>
              {orderDirection === "asc" ? (
                <Icons.arrowUp className="mr-2 inline h-4 w-4" />
              ) : (
                <Icons.arrowDown className="mr-2 inline h-4 w-4" />
              )}
            </span>
          ) : null}
        </div>
        <div className="text-xs">
          <button
            className="m-1 inline rounded-lg bg-red px-1.5 py-1 text-center text-xs  font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-red dark:focus:ring-blue-800"
            type="button"
            disabled={true}
          >
            <Icons.refresh className="inline h-4 w-4"></Icons.refresh>{" "}
            {eventCount}
          </button>
          <button
            className="m-1 inline rounded-lg bg-yellow-700 px-1.5 py-1 text-center text-xs  font-medium text-white hover:bg-yellow-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-yellow-700 dark:focus:ring-blue-800"
            type="button"
            disabled={true}
          >
            <Icons.testTube
              className={`inline h-4 w-4 ${isLoading ? "animate-spin" : null}`}
            ></Icons.testTube>{" "}
            {eventCount}
          </button>
        </div>
      </div>
      {loadedEvents.length > 0
        ? loadedEvents.map((event) => (
            <div key={event.id} className="col-span-12 grid grid-cols-12">
              <div className="col-span-2">
                <a
                  href={`https://anedot.com/accounts/${event.payload?.account_uid}/integrations/requests/${event.webhookId}?integrationId=${event.integrationId}`}
                  target="_blank"
                >
                  {idType === "donationId"
                    ? event.payload?.donation?.id
                    : event.webhookId}
                </a>{" "}
              </div>

              <div className="group relative flex">{event.status}</div>
              <div className={`${event.attention ? "text-red" : "text-white"}`}>
                {" "}
                {event.matchQuality}
                <div
                  className="w-100 absolute left-1/4 z-50 m-2 mx-auto -translate-x-1/4 translate-y-full rounded-md bg-black
                    px-5 py-3 text-sm text-gray-100 opacity-0 transition-opacity duration-75 ease-in-out group-hover:opacity-100"
                >
                  {event.attentionReason}
                </div>
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
              <div className="col-span-2">
                <span className={event.segmentMatch ? "" : "text-rose-500"}>
                  {event.payload?.custom_field_responses?.segment_name ||
                    event.payload?.custom_field_responses?.campaign_segment ||
                    event.payload?.custom_field_responses?.campaign_segment_ ||
                    event.payload?.custom_field_responses?.campaign_source ||
                    ""}
                </span>
              </div>
              <div>
                <a
                  href={`https://app.virtuoussoftware.com/Generosity/Contact/View/${event.virtuousContact}`}
                  target="_blank"
                >
                  {event.virtuousContact}
                </a>
              </div>
              <div className="">{event.synced ? `synced` : `pending`} </div>
              <div className="">
                {event.createdAt.toLocaleString("en-us", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
              </div>
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
        : `no events found`}
      <div className="col-span-12 grid grid-cols-3">
        <div
          className="inline cursor-pointer p-1"
          onClick={() => (page > -0 ? setPage(page - 1) : null)}
        >
          <Icons.chevronLeft className="inline" /> Previous{" "}
        </div>
        <div className="inline cursor-pointer p-1">
          {page * 25 + 1} - {page * 25 + loadedEvents.length} of {eventCount}
        </div>
        <div
          className="inline cursor-pointer p-1"
          onClick={() => setPage(page + 1)}
        >
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
              <span className="font-bold">dbId:</span> {selectedEvent.id}{" "}
              <span className="font-bold">webhookId:</span>{" "}
              {selectedEvent.webhookId}
            </div>
            {selectedEvent?.attentionReason &&
            selectedEvent?.attentionReason.length > 2 ? (
              <div className="space-y-6 p-6">
                <h2>Attention</h2>
                {JSON.parse(selectedEvent?.attentionReason).map((reason) => (
                  <>
                    {reason}
                    <br />
                  </>
                ))}
              </div>
            ) : null}
            <div className="space-y-6 p-6">
              <h2>Event</h2>
              {JSON.stringify(selectedEvent?.payload)}
            </div>
            <div className="space-y-6 p-6">
              <h2>Generated Virtuous Query</h2>
              {selectedEvent?.virtuousQuery}
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
