'use client'

import { redirect } from '@routing'

export default function SettingPage() {
  redirect({
    href: { pathname: '/main/setting/account' },
    locale: 'en'
  })
}
