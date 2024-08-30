'use client'

import { redirect } from '@/routing'

/**
 * Current redirect to /auth/basic
 */
export default function Home() {
  redirect('/auth/basic')
}
