import Link from 'next/link'
import { Lock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AccessDenied() {
  return (
    <div className="h-screen bg-base flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <Lock className="h-8 w-8 text-copy-muted" />
        <h1 className="text-xl font-semibold text-copy-primary">Access Denied</h1>
        <p className="text-copy-muted text-sm max-w-xs">
          You don&apos;t have access to this project, or it doesn&apos;t exist.
        </p>
        <Link href="/editor" className={cn(buttonVariants({ variant: 'outline' }))}>
          Back to Editor
        </Link>
      </div>
    </div>
  )
}
