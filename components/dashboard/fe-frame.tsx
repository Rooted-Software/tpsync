'use client'
import styles from './grid.module.css'
import { UniversalButton } from './universal-button'
import { useState, Fragment, useEffect } from 'react'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { CheckCircle } from 'lucide-react'
import { CheckSquare } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Dialog, Transition } from '@headlessui/react'
import tr from 'date-fns/esm/locale/tr'
import { AnyZodObject } from 'zod'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

interface BatchPreviewProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
  batches: any[]
  defaultCreditAccount?: any
  defaultDebitAccount?: any
  defaultJournal?: any
  feEnvironment?: string
  journalName?: string
}




export function FeFrame({
  projects,
  feAccounts,
  mappings,
  batches,
  className,
  defaultCreditAccount,
  defaultDebitAccount,
  defaultJournal,
  feEnvironment,
  journalName,
  ...props
}: BatchPreviewProps) {
  const router = useRouter()
  function advanceStep() { 

    router.push('/step8')
  
  }
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [virProjectID, setVirProjectID] = React.useState<any[]>([])
  const [feAccountID, setFeAccountID] = React.useState('')
  const [feAccountObj, setFeAccountObj] = React.useState({})
  const [textFilter, setTextFilter] = React.useState('')
  const [textFeFilter, setTextFeFilter] = React.useState('')
  const [filteredProjects, setFilteredProjects] = React.useState<any[]>(projects )
  const [filteredAccounts, setFilteredAccounts] = React.useState<any[]>(feAccounts)
  

  // Project filters
  const [filterProjectName, setFilterProjectName] = React.useState<boolean>(true)
  const [filterProjectCode, setFilterProjectCode] = React.useState<boolean>(true)
  const [filterOnlineDisplayName, setFilterOnlineDisplayName] = React.useState<boolean>(false)
  const [filterExternalAccountingCode, setFilterExternalAccountingCode] = React.useState<boolean>(true)
  const [filterDescription, setFilterDescription] = React.useState<boolean>(true)
  const [filterIsActive, setFilterIsActive] = React.useState<boolean>(true)
  const [filterIsPublic, setFilterIsPublic] = React.useState<boolean>(false)
  const [filterIsTaxDeductible, setFilterIsTaxDeductible] = React.useState<boolean>(false)
  const [filterCase, setFilterCase] = React.useState<boolean>(false)

  // Account filters
  const [filterAccountId, setFilterAccountId] = React.useState<boolean>(true)
  const [filterAccountDescription, setFilterAccountDescription] = React.useState<boolean>(true)
  const [filterAccountNumber, setFilterAccountNumber] = React.useState<boolean>(true)
  const [filterFeCase, setFilterFeCase] = React.useState<boolean>(false)

  const [batchName, setBatchName] = React.useState<string>('')
  const [batchId, setBatchId] = React.useState<string>('')
  const [gifts, setGifts] = React.useState<any[]>([])
  const [batchTotal, setBatchTotal] = React.useState<number>(0)
  const [batchCredits, setBatchCredits] = React.useState<number>(0)
  const [batchDebits, setBatchDebits] = React.useState<number>(0)
  const [synced, setSynced] = React.useState<boolean>(false)

  const [openWindow, setOpenWindow] = React.useState<boolean>(false)

  function lookupProject(projectId) { 
    const project = projects.find(p => p.project_id === projectId)

    return <span className='text-sm'>{project.name}</span>
  }

  function lookupProjectId(projectId) { 
    const project = projects.find(p => p.id === projectId)

    return <span className='text-sm'>{project?.name}</span>
  }

  function lookupAccount(accountId) { 
    const account = feAccounts.find(a => a.account_id === accountId)
    return <span className=''>{account?.description}</span>
  }


  function lookupMapping(projectId) { 
    const tempProj = projects.find(p => p.id === projectId)
    console.log(tempProj)
    const mapping = mappings.find(m => m.virProjectId === tempProj?.project_id)
    console.log(mapping)
    if (!mapping) { return <span className=''>{tempProj?.name} <br/><Icons.arrowRight className="mr-2 h-4 w-4" /> {lookupAccount(parseInt(defaultCreditAccount))} (default)</span> }
    return <span className=''>{tempProj.name} <br/><Icons.arrowRight className="mr-2 h-4 w-4" />  {lookupAccount(mapping.feAccountId)}</span>
  }

  let [isOpen, setIsOpen] = useState(false)
  let [isFeAccountFilterOpen, setIsFeAccountFilterOpen] = useState(false)
  function addVirProject(id) {
    console.log(id); 
    var array =  virProjectID.slice(); 
    array.push(id);
    setVirProjectID(array);

  }


  useEffect(() => {
    filterProjects(textFilter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings, virProjectID])

  useEffect(() => {
    filterProjects(textFilter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings, virProjectID])

  function removeVirProject(id){ 
    var array = virProjectID;
    const index = array.indexOf(id);
    if (index > -1) { // only splice array when item is found
      array.splice(index, 1); // 2nd parameter means remove one item only
    }
    setVirProjectID(array.slice());

  }

  function filterProjects(value) { 

    if (!filterCase) { 
      value =value.toLowerCase(); 
    }
   if (value === "" || value.length===0 || value === null || value===undefined) { 
      setFilteredProjects(projects.filter((project)=> { 
      if (filterIsActive) { 
        if (project.isActive !== true) { return false }
      }
      if (filterIsPublic) { 
        if (project.isPublic !== true) { return false }
      }
      if (filterIsTaxDeductible) { 
        if (project.isTaxDeductible !== true) { return false }
      }
      if  (mappings.find((mapping) => mapping.virProjectId === project.project_id)) {return false}
      return true 
    }
    )) 
  } else { 
    setFilteredProjects(projects.filter((project)=> {
      if (filterIsActive) { 
        if (project.isActive !== true) { return false }
      }
      if (filterIsPublic) { 
        if (project.isPublic !== true) { return false }
      }
      if (filterIsTaxDeductible) { 
        if (project.isTaxDeductible !== true) { return false }
      }
      let wholeString = ''; 
      if (filterProjectName) { 
        wholeString = wholeString + project.name
      }
      if (filterProjectCode) { 
        wholeString = wholeString + project.projectCode
      }
      if (filterExternalAccountingCode) { 
        wholeString = wholeString + project.externalAccountingCode
      }
      if (filterOnlineDisplayName) { 
        wholeString = wholeString + project.onlineDisplayName 
      }

      if (filterDescription) { 
        wholeString = wholeString + project.description
      }
      if (!filterCase) { 
        wholeString = wholeString.toLowerCase()
      }
      if  (mappings.find((mapping) => mapping.virProjectId === project.project_id)) {return false}

      return wholeString.includes(value)
    }));
  }

  }

  function filterFeAccounts(value) { 
   
    if (!filterFeCase) { 
      value =value.toLowerCase(); 
    }
   if (value === "" || value.length===0 || value === null || value===undefined) 
    { setFilteredAccounts(feAccounts) } 
   else { 
    setFilteredAccounts(feAccounts.filter((account)=> {
     
      let wholeString = ''; 
      if (filterAccountId) { 
        wholeString = wholeString + account.account_id
      }
      if (filterAccountNumber) { 
        wholeString = wholeString + account.account_number
      }
      if (filterAccountDescription) { 
        wholeString = wholeString + account.description
      }
      
      if (!filterFeCase) { 
        wholeString = wholeString.toLowerCase(); 
      }
      
      return wholeString.includes(value)
    }));
  }

  }

  async function postFE() {

    if (isLoading) { return }
    setIsLoading(true);


    console.log('client side sync')
    const response = await fetch('/api/reJournalEntryBatches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batchId: batchId,
        batchName: batchName,
        defaultJournal: defaultJournal,
      }),
    })

   

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Something Went Wrong 3.',
          description: 'Your Mapping was not created.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong4.',
        description: 'Your batch was not synced. Please try again.',
        variant: 'destructive',
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
      setSynced(data.synced)
      if (data.record_id) {
      router.push(`/step4b?batchId=${batchId}&batchName=${batchName}&defaultJournal=${defaultJournal}&synced=${data.synced}&record_id=${data.record_id}`)
    }
  }, 400);
    
  }

  async function onDeleteMapping(mappingId) {
    console.log('deleting mapping: ' + mappingId);
    if (isLoading) { return }
    setIsLoading(true);

    console.log(virProjectID); 
    console.log(feAccountID); 
    console.log('client side deleting')
    const response = await fetch('/api/mapping/' + mappingId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    
    })

    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Something went wrong1.',
          description: 'Mapping was not removed.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong2.',
        description: 'Your mapping was not removed.',
        variant: 'destructive',
      })
    }
     toast({
      title: 'Mapping Removed.',
      description: 'Your Mapping was removed',
      variant: 'destructive',
    })

    console.log('invalidating cache')

    // This forces a cache invalidation.
    router.refresh()
  }

  async function syncGifts(tempBatchName, tempBatchId) {
    setBatchName(tempBatchName); 
    setBatchId(tempBatchId);
    if (tempBatchName === 'none') { tempBatchName= null}
    setIsLoading(true)
   
    const response = await fetch('/api/syncGifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_name: tempBatchName, batch_id: tempBatchId }),
    })

    setIsLoading(false)

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
        description: 'Your gifts were not synced. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()

    console.log(data)
    if (data?.list) {
      setGifts(data?.list)
      setBatchCredits(data.list.reduce((total, gift) => total+gift.amount, 0))
    } else {
      setGifts([])
    }
    // This forces a cache invalidation.
    router.refresh()
  }
  const searchParams = useSearchParams()
  const record_id = searchParams?.get('record_id')
  const envid = searchParams?.get('envid')
  if (openWindow === false) { 
    setOpenWindow(true)
    console.log(record_id, ' : ', envid)
    const felink = 'https://host.nxt.blackbaud.com/journalentry/' + record_id + '?envid=' + envid
    const popup = window.open(
      felink,
       'newFE',
      'width=1750,height=500, top=25, left=150'
    )
    console.log(felink)
    //chaged from window.focus
    if (document.hasFocus()) {
      popup?.focus()
    }
  }

  return (<><div className="align-self-bottom align-items-bottom m-auto flex h-screen w-full flex-col justify-center space-y-6 bg-dark pt-4 text-center">
      <h1 className='font-3xl my-0 py-0 text-3xl  text-white xl:my-4 xl:py-4'>Review Results</h1>
      <div className="m-auto flex flex-col justify-center space-y-3 text-white">
      <a className='pt-4 underline' href={`javascript:window.open('https://host.nxt.blackbaud.com/journalentry/${record_id}?envid=${feEnvironment}', 'financialEdge', 'width=1750,height=500, top=25, left=150');`}>Click here to open the new Financial Edge batch in a new window.</a> <br/>After reviewing the results, close the window to return here.  
   
      <button
        onClick={advanceStep}
        className={cn(
          `relative m-8 inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
          {
            'cursor-not-allowed opacity-60': isLoading,
          },
       
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.arrowRight className="mr-2 h-4 w-4" />
        )}
        Continue
      </button>
    
    </div>
    </div> </>
  )
}
