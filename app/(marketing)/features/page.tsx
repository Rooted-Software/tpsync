import { Icons } from '@/components/icons'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <section className="container flex flex-col items-center gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] tracking-tighter sm:text-3xl md:text-6xl">
          Features included with PRO 
        </h2>
        <p className="leading-normal text-slate-700 sm:text-lg sm:leading-7">
          Go PRO to unlock all features including unlimited posts for your blog.
        </p>
      </div>
      <div className="grid w-1/2 items-start gap-10 rounded-lg border border-slate-200 p-10">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            What&apos;s included in the PRO plan
          </h3>
          <ul className="grid gap-3 text-sm text-slate-600 sm:grid-cols-1">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Unlimited Posts
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Unlimited Users
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Custom domain
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Dashboard Analytics
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Access to Discord
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Premium Support
            </li>
          </ul>
        </div>
      </div>

      <div className='flex flex-col items-center w-1/2 p-10 rounded-lg border border-slate-200'>
        <h3 className="text-xl font-bold sm:text-2xl">
          Get started now
        </h3>
        <div className='text-center'>
          <h4 className="text-7xl font-bold">$19</h4>
          <p className="text-sm font-medium text-slate-600">Billed Monthly</p>
        </div>
        <Link
          href="/login"
          className="relative inline-flex h-12 w-52 mt-4 items-center justify-center rounded-md border border-transparent bg-brand-500 py-6 text-center font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 max-w-xs"
        >
          Go PRO
        </Link>
      </div>

      <div className="mx-auto flex flex-col text-center gap-4 md:max-w-[52rem]">
        <p className="leading-normal text-slate-700 sm:leading-7">
          Taxonomy is a demo app.{' '}
          <strong>You can test the upgrade and won&apos;t be charged.</strong>
        </p>
      </div>
    </section>
  )
}
