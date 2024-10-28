import { EUserRole } from '@/entities/enum'
import { ChevronLeft, Cog, HomeIcon, Image, User, Users } from 'lucide-react'

export const RouteConf = {
  home: {
    key: 'home',
    group: 'Workflows',
    title: 'Workflows',
    path: '/main',
    SubIcon: HomeIcon,
    backUrl: false,
    onNav: true,
    minPerm: EUserRole.User
  },
  gallery: {
    key: 'gallery',
    title: 'Gallery',
    group: 'Gallery',
    path: '/main/gallery',
    SubIcon: Image,
    backUrl: false,
    onNav: true,
    minPerm: EUserRole.User
  },
  setting: {
    key: 'setting',
    title: 'Setting',
    group: 'Setting',
    path: '/main/setting',
    SubIcon: Cog,
    backUrl: false,
    onNav: true,
    minPerm: EUserRole.User
  },
  settingAccount: {
    key: 'settingAccount',
    title: 'Setting Account',
    group: 'Setting',
    path: '/main/setting/account',
    SubIcon: User,
    backUrl: false,
    onNav: false,
    minPerm: EUserRole.User
  },
  settingUsers: {
    key: 'settingUsers',
    title: 'Setting Users',
    group: 'Setting',
    path: '/main/setting/users',
    SubIcon: Users,
    backUrl: false,
    onNav: false,
    minPerm: EUserRole.Admin
  },
  execute: {
    key: 'execute',
    title: 'Tasks',
    group: 'Workflows',
    path: '/main/workflow',
    SubIcon: ChevronLeft,
    backUrl: '/main',
    onNav: false,
    minPerm: EUserRole.User
  }
} as const

export type TRouterKey = keyof typeof RouteConf
