'use client'

import { Button } from '@/components/ui/button'
import { redirect } from '@/routing'
import { signOut } from 'next-auth/react'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  const handlePressLogout = () => {
    signOut()
  }
  return (
    <div>
      <Button onClick={handlePressLogout}>Logout</Button>
    </div>
  )
}
