'use client'

import { trpc } from '@/utils/trpc'

import type React from 'react'
import type { PropsWithChildren } from 'react'

const TRPCLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <>{children}</>
}

export default trpc.withTRPC(TRPCLayout) as typeof TRPCLayout
