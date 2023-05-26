'use client'

import { UniversalButton } from './universal-button'
import { useState, Fragment } from 'react'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { CheckCircle } from 'lucide-react'
import { CheckSquare } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Dialog, Transition } from '@headlessui/react'

interface MappingCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
}



export function MappingCreateButton({
  projects,
  feAccounts,
  mappings,
  className,
  ...props
}: MappingCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [virProjectID, setVirProjectID] = React.useState<any[]>([])
  const [feAccountID, setfeAccountID] = React.useState('')
  const [textFilter, setTextFilter] = React.useState('')
  const [filteredProjects, setFilteredProjects] = React.useState<any[]>([])
  const [filteredAccounts, setFilteredAccounts] = React.useState<any[]>([])
  

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

  let [isOpen, setIsOpen] = useState(false)
  function addVirProject(id) {
    var array =  virProjectID; 
    array.push(id);
    setVirProjectID(array);
    console.log(array);
  }

  function removeVirProject(id){ 
    var array = virProjectID;
    const index = array.indexOf(id);
    if (index > -1) { // only splice array when item is found
      array.splice(index, 1); // 2nd parameter means remove one item only
    }
    setVirProjectID(array);
    console.log(array);
  }

  function filterProjects(value) { 
    console.log(value.length);
    if (!filterCase) { 
      value =value.toLowerCase(); 
    }
   if (value === "" || value.length===0 || value === null || value===undefined) 
    { setFilteredProjects(projects) } 
   else { 
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
      let wholeString = project.name; 
      if (filterDescription) { 
        wholeString = wholeString + project.description
      }
      if (!filterCase) { 
        wholeString = wholeString.toLowerCase(); 
      }
      
      return wholeString.includes(value)
    }));
  }
    console.log(filteredProjects.length);
  }


  async function onClick() {
    setIsLoading(true);
    console.log(virProjectID); 
    console.log(feAccountID); 
    console.log('client side mapping')
    const response = await fetch('/api/mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        virProjectIDs: virProjectID,
        feAccountID: feAccountID,
      }),
    })

    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Limit of 3 posts reached.',
          description: 'Please upgrade to the PRO plan.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }



    // This forces a cache invalidation.
    router.refresh()
  }

  if (!projects || projects.length < 1) {
    const projectData = onClick()
    console.log('getting project data');
  }
  console.log(filteredProjects.length); 
  return (<>
    <div className="h-screen bg-dark lg:p-8">
      <h1 className='font-3xl py-4 text-3xl text-white'> Master Data Map</h1>
      <div className="m-auto flex flex-col justify-center space-y-6 ">
      <div className="w-full text-left " >
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>Virtuous Projects</span> 
            </p>
          </div>
        <div className="flex w-full flex-row space-y-2 text-center">
          
          <div className="mt-1 basis-2/3 items-center justify-end">
              <input
                id='textFilter'
                value={textFilter}
                onChange={(e)=> {setTextFilter(e.target.value); console.log(e); filterProjects(e.target.value)}}
                placeholder="Search"
                className="w-full rounded-lg border border-gray-400 p-2"
              />
          </div>
          <div className='align-right items-right my-auto mx-2 basis-1/3'>
            <button
              onClick={(e)=>{e.preventDefault(); setIsOpen(true)}}
              className='inline-flex h-9 shrink items-center rounded-md border border-transparent bg-tightWhite px-4 py-2 text-sm font-medium text-white text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
              disabled={isLoading}
              {...props}
            >
              <Icons.listFilter className="mr-2 h-4 w-4" />
                Filter
              </button>
            </div>   
            <UniversalButton icon='refresh' className='bg-tightWhite text-dark' title="" route="/api/virProjects" method="GET" fields={['id', 'name', 'projectCode']} />
        </div>
      <div className='flex w-full flex-row'>
            {filteredProjects?.length ? (
      <div className='justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark' style={{height: '50vh'}}>
        {filteredProjects && filteredProjects.map((project) => (<div className='p-1' key={project.project_id}>
        <div className="flex flex-row items-center" >
          <input id={`checked-checkbox-${project.project_id}`} className='focus:outline-none focus:ring-2 ' type="checkbox" value={project.project_id} onClick={(e)=>{if (e.target.checked) {addVirProject(e.target.value)} else {removeVirProject(e.target.value)} }} className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
          <label htmlFor={`checked-checkbox-${project.project_id}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{project.name} </label>
                
        </div>{project.onlineDisplayName
                ? <div className='ml-8 pl-3 text-xs font-bold text-brand-400'> {project.onlineDisplayName}</div>
                : null} 
        <div className='ml-8 pl-3 text-xs text-brand-400'>id: {project.id} | Project code: {project.projectCode}</div>
        <div className='ml-8 pl-3 text-xs text-brand-400'>{project.externalAccountingCode !=='none' ? <span> Accounting Code: {project.externalAccountingCode}</span> : null} {project.description ? <span>| desc: {project.description}</span> : null}</div>
        <div className='ml-8 pl-3 text-xs text-brand-400'>{project.isPublic ? <span className='text-success'>Public</span> : null } {project.isActive ? <span className='text-red'>Active</span> : null } {project.isTaxDeductible ? <span className='text-green'>Tax Deductible</span> : null }</div> 
      </div>
          ))}
    </div>
      ) : (
        <EmptyPlaceholder >
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title className='text-white'>
            No Virtuous Projects Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Try adjusting the search terms, filter, or refreshing the project list from virtuous.
          </EmptyPlaceholder.Description>
         
        </EmptyPlaceholder>
      )}
          </div>
        </div>
   
      </div>
      <div className="h-screen bg-dark  lg:p-8">
      <h1 className='font-3xl p-4 text-3xl text-white'>&nbsp;</h1>
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center">
          <div className="w-full text-left" >
                <p className="justify-left text-lg text-white">
                  <span className='text-accent-1'>Financial Edge Accounts</span> 
                </p>
            </div>
            <UniversalButton title="Get Accounts" route="/api/reAccounts" method="GET" fields={['account_code_id', 'description', 'value']} />
            {feAccounts?.length ? (
         <div className='justify-left m-8 overflow-scroll bg-whiteSmoke p-4 text-left text-dark' style={{height: '50vh'}}>
          {feAccounts.map((feAccount) => (
            <div className='p-1' key={feAccount?.account_code_id} >
            <div className="flex items-center" >
            <input id={`checked-checkbox-${feAccount?.account_code_id}`} className='focus:outline-none' type="radio" name="re-radio" value={feAccount?.account_code_id} onClick={(e)=>{setfeAccountID(e.target.value); console.log(e.target.value)}} className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
            <label htmlFor={`checked-checkbox-${feAccount?.account_code_id}`}  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{feAccount?.description
                  ? <span className='mx-4'> {feAccount?.description}</span>
                  : <span className='mx-4'> {feAccount?.value}</span>} </label>
        </div>
              </div>
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
            No Accounts Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any RE/FE accounts yet.
          </EmptyPlaceholder.Description>
          
        </EmptyPlaceholder>
      )}
          </div>
        </div>
        <button
        onClick={onClick}
        className={cn(
          `relative m-8 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
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
          <Icons.add className="mr-2 h-4 w-4" />
        )}
        Map Project
      </button>
      </div>
      <div className='flex h-screen w-full flex-col bg-whiteSmoke p-8 pt-[24px] '>
        <h1 className='py-8 text-2xl'>Mapping </h1>

        {mappings?.length ? (
         <div className='justify-left m-8 overflow-scroll bg-whiteSmoke p-4 text-left text-dark' style={{height: '55vh'}}>
          {mappings.map((mapping) => (
            <div className='p-1' key={mapping.id} >
            <div className="flex items-center" > <Icons.trash className="text-red mr-2 h-4 w-4" /> {mapping.virProjectId} --  {mapping.feAccountId}
             
            
        </div>
              </div>
          ))}

<button
        onClick={onClick}
        className={cn(
          `relative m-8 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
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
          <Icons.add className="mr-2 h-4 w-4" />
        )}
        Continue (Data Review)
      </button>
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
            No Mapings Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any mappings yet.
          </EmptyPlaceholder.Description>
          
        </EmptyPlaceholder>
      )}
      
    </div>
    <div>
      
      
    <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={()=>setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Virtuous Project Filter
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                    <input id={`checkbox-filterProjectName`} 
                      checked={filterProjectName ? true : false}
                      type="checkbox" value={filterProjectName} 
                      onClick={(e)=>{if (e.target.checked) {setFilterProjectName(true)} else {setFilterProjectName(false)} }} 
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 text-large focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 focus:outline-none focus:ring-2 " />
                    <label htmlFor={`checkbox-filterProjectName`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Project Name </label>
                    <input id={`checkbox-filterProjectCode`} 
                      type="checkbox" value={filterProjectCode} 
                      onClick={(e)=>{if (e.target.checked) {setFilterProjectCode(true)} else {setFilterProjectCode(false)} }} 
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 text-large focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 focus:outline-none focus:ring-2 " />
                    <label htmlFor={`checkbox-filterProjectCode`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Project Code </label>
                    
                      Include Names <br/>
                      Include Project Code<br/>
                      Include External Accounting Code<br/>
                      Include Online Display Name<br/>
                      Include Description<br/>
                      Active<br/>
                      Public<br/>
                      Tax Deductible<br/>

                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={()=>setIsOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
    </div>

    </>
  )
}
