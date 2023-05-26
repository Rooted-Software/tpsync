import { DashboardConfig } from 'types'

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: 'Features',
      href: '/features',
      // disabled: true,
    },
    {
      title: 'Pricing',
      href: '/pricing',
    },
    {
      title: 'Blog',
      href: '/blog',
    },
    {
      title: 'Documentation',
      href: '/docs',
    },
    {
      title: 'Support',
      href: '/support',
    },
    {
      title: 'Contact',
      href: '/contact',
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'post',
    },
    {
      title: 'Batch Management',
      href: '/batches',
      icon: 'post',
    },
    {
      title: 'Project Management',
      href: '/projects',
      icon: 'post',
    },
    {
      title: 'RE Accounts',
      href: '/reAccounts',
      icon: 'post',
    },
    {
      title: 'RE Journal',
      href: '/reJournals',
      icon: 'post',
    },
    {
      title: 'Content Management',
      href: '/studio',
      icon: 'post',
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: 'billing',
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
    },
  ],
}
