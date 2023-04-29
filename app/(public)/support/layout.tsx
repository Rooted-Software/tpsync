// import { DocsSidebarNav } from '@/components/docs/sidebar-nav'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { DocsSearch } from '@/components/search'
import { SiteFooter } from '@/components/site-footer'
import { docsConfig } from '@/config/docs'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="container flex-1">{children}</div>
}
