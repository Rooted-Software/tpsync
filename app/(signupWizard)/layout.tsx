import { Stepper } from '@/components/stepper'
interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {

  return (
  
  <div className="h-screen min-h-screen bg-dark ">
    <div className="container grid h-full  w-screen flex-col items-center  bg-dark lg:max-w-none lg:grid-cols-1 lg:px-0">{children}
  <Stepper  />
  </div>
  </div>)
}
