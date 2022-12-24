import { getDocBySlug, getSettings } from 'lib/sanity.client'
import { ogImageSchema } from "@/lib/validations/og"
import { absoluteUrl } from "@/lib/utils"
import * as z from "zod"

interface HeadProps {
  params: {
    slug?: string
  }
  og?: z.infer<typeof ogImageSchema>
}

export default async function Head({ params }: HeadProps) {
  const slug = params?.slug

  const doc = await getDocBySlug(slug)

  if (!doc) {
    return null
  }

  const title = `${doc.title} - AddSiteName`
  const url = process.env.NEXT_PUBLIC_APP_URL
  let ogUrl = new URL(`${url}/og.jpg`)
  let og={ heading: doc.description, type: "Documentation", mode: "light" }
  const ogTitle = og?.heading || doc.title
  const ogDescription = doc.description

  if (og?.type) {
    ogUrl = new URL(`${url}/api/og`)
    ogUrl.searchParams.set("heading", ogTitle)
    ogUrl.searchParams.set("type", og.type)
    ogUrl.searchParams.set("mode", og.mode || "dark")
  }
  return (
    <>
    <title>{title}</title>
    <link rel="canonical" href={absoluteUrl(doc.slug)} />
    <meta name="description" content={ogDescription} />
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={ogDescription} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={ogUrl.toString()} />
    <meta name="twitter:title" content={ogTitle} />
    <meta name="twitter:description" content={ogDescription} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={url} />
    <meta name="twitter:image" content={ogUrl.toString()} />
  </>
  )
}