import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from 'lib/sanity.image'

import { getAllFeatures } from '@/lib/sanity.client'

export default async function FeaturePage() {
  // Fetch queries in parallel
  const features = await getAllFeatures();
  // console.log("features: ", features, features[0].description[0].children[0].text);

  return (
    <section className="container flex flex-col items-center gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto w-full p-10 rounded-lg border border-slate-200 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col justify-center text-center col-span-2 md:text-left">
          <h2 className="font-bold leading-[1.1] tracking-tighter text-3xl md:text-5xl">
            Go PRO to unlock all features 
          </h2>
          <p className="text-1xl md:text-2xl mt-2 mb-2">
            including unlimited posts
          </p>
        </div>
        <div className='flex flex-col items-center col-span-1'>
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
      </div>

      <h3 className="text-xl font-bold sm:text-2xl">
        Features included with Rooted PRO
      </h3>
      
      <div className="w-full grid grid-cols-1 gap-20 md:grid-cols-2">
        {features.map((e) => {
          const description = e.description[0].children[0].text;

          return (
            <div key={e._id} className="w-full">
               {e.coverImage && (
                  <Image
                    src={urlForImage(e.coverImage).height(1000).width(2000).url()}
                    alt={e.title}
                    width={804}
                    height={452}
                    className="rounded-md border border-slate-200 bg-slate-200"
                    priority={false}
                  />
              )}
              <h2 className="text-2xl font-bold mt-3">{e.title}</h2>
              {description && <p className="text-slate-600">{description}</p>}
            </div>
          )
        })}
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
