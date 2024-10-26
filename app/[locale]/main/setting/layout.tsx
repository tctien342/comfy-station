'use client'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { RouteConf } from '@/constants/route'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { cn } from '@/lib/utils'
import { Link } from '@/routing'
import { useMemo, useState } from 'react'

enum ESettingTabs {
  Account,
  Users
}

const Layout: IComponent = ({ children }) => {
  const { routeConf } = useCurrentRoute()

  const renderTabs = useMemo(() => {
    const settings = Object.values(RouteConf).filter((v) => v.path.includes('/main/setting/'))
    return settings.map((setting) => {
      const Icon = setting.SubIcon
      return (
        <Link
          href={setting.path}
          key={setting.key}
          className={cn('w-full px-2 py-4 flex gap-2 items-center btn', {
            'bg-foreground text-background': routeConf?.key === setting.key
          })}
        >
          <Icon className='w-6 h-6' />
          <span className='uppercase text-sm font-bold'>{setting.title}</span>
        </Link>
      )
    })
  }, [routeConf?.key])

  return (
    <div className='w-full h-full flex flex-row divide-x-[1px] border-t'>
      <div className='w-full md:w-[300px] h-full flex flex-col divide-y-[1px]'>{renderTabs}</div>
      <div className='flex-1 h-full hidden md:block'>{children}</div>
    </div>
  )
}

export default Layout
