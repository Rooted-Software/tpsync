interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return <div className="h-screen min-h-screen bg-dark">{children}</div>
  
}
