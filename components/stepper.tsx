'use client'

import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { width } from './OpenGraphImage'

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
    percent
}


export function Stepper({ className, percent, ...props }: StepperProps) {
 console.log('stepper',  percent)

  return (
    <div className=' absolute bottom-0 left-0 w-full items-center justify-center bg-background p-8'> 
<div className='relative top-[72px] left-[5%]  m-auto ml-4 w-[90%] bg-[#E8F1FB]'>
  <div className={`advanceTransition  rounded-xl border-[20px] border-b border-accent-1`} style={{width: `${percent}%`}}></div>
</div>
<div className='w-100 m-auto ml-8 p-8'>
<ol className="flex w-full items-center">
<li className="after:width:110% flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:border-[0px] after:content-['']">
<span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white drop-shadow-lg dark:bg-blue-800 lg:h-[60px] lg:w-[60px]">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-1 dark:bg-blue-800 lg:h-[50px] lg:w-[50px]">
  <svg x="16" y="18" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z" fill={percent >= 0 ? '#6BE4BC' : "#E8F1FB"}/>
  </svg>
  </span>
</span>

</li>
<li className="after: flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:content-['']">
<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${percent >= 25 ? 'bg-accent-1' : 'tightWight'} drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}>
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white  dark:bg-blue-800 lg:h-9 lg:w-9">
  <svg x="16" y="18" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z" fill={percent >= 25 ? '#6BE4BC' : "#E8F1FB"}/>
  </svg>
  </span>
</span>
</li>
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${percent >= 50 ? 'bg-accent-1' : 'tightWight'} drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}>
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-blue-800 lg:h-9 lg:w-9">
  <svg x="16" y="18" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z" fill={percent >= 50 ? '#6BE4BC' : "#E8F1FB"}/>
  </svg>
  </span>
</span>
</li>
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full after:content-['']">
<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${percent >= 75 ? 'bg-accent-1' : 'tightWight'} drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}>
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-blue-800 lg:h-9 lg:w-9">
  <svg x="16" y="18" width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z" fill={percent >= 75 ? '#6BE4BC' : "#E8F1FB"}/>
  </svg>
  </span>
</span>
</li>
<li className="flex items-center">
<span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-white drop-shadow-lg dark:bg-blue-800 lg:h-[60px] lg:w-[60px]">
  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-1 dark:bg-blue-800 lg:h-[50px] lg:w-[50px]">
 {percent}%
  </span>
</span>
</li>

</ol>
<ol className="flex w-full items-center">
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
<span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
  <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
  System Connect
  </span>
</span>

</li>
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
<span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
  <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
  Data Mapping
  </span>
</span>

</li>
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
<span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
  <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
 Data Review
  </span>
</span>

</li>
<li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
<span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
  <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
  Sync First Batch
  </span>
</span>

</li>
<li className="flex  items-center text-dark after:inline-block after:h-1 after:content-['']">
<span className="flex h-10 w-10  items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
  <span className="flexitems-center justify-center rounded-full bg-white font-bold ">
 Complete
  </span>
</span>

</li>
</ol>
</div>
</div>
  )
}





