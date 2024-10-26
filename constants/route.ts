import { ChevronLeft, Cog, HomeIcon, Image, User, Users } from 'lucide-react'

export const RouteConf = {
  home: {
    key: 'home',
    group: 'Workflows',
    title: 'Workflows',
    path: '/main',
    SubIcon: HomeIcon,
    backUrl: false,
    onNav: true
  },
  gallery: {
    key: 'gallery',
    title: 'Gallery',
    group: 'Gallery',
    path: '/main/gallery',
    SubIcon: Image,
    backUrl: false,
    onNav: true
  },
  setting: {
    key: 'setting',
    title: 'Setting',
    group: 'Setting',
    path: '/main/setting',
    SubIcon: Cog,
    backUrl: false,
    onNav: true
  },
  settingAccount: {
    key: 'settingAccount',
    title: 'Setting Account',
    group: 'Setting',
    path: '/main/setting/account',
    SubIcon: User,
    backUrl: false,
    onNav: false
  },
  settingUsers: {
    key: 'settingUsers',
    title: 'Setting Users',
    group: 'Setting',
    path: '/main/setting/users',
    SubIcon: Users,
    backUrl: false,
    onNav: false
  },
  execute: {
    key: 'execute',
    title: 'Tasks',
    group: 'Workflows',
    path: '/main/workflow',
    SubIcon: ChevronLeft,
    backUrl: '/main',
    onNav: false
  }
} as const

export type TRouterKey = keyof typeof RouteConf
