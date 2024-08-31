'use client'

import { SessionProvider } from 'next-auth/react'

import type React from 'react'
import type { PropsWithChildren } from 'react'

export const SessionLayout: React.FC<PropsWithChildren & { session: any }> = ({ session, children }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
