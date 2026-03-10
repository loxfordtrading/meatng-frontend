import { Loader2 } from 'lucide-react'
import React from 'react'

export const LoadingData = () => {
  return (
    <div className="flex items-center justify-center py-20 rounded-3xl">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
    </div>
  )
}
