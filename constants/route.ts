import { ChevronLeft, Cog, HomeIcon, Image } from 'lucide-react'

export const RouteConf = {
  home: {
    key: 'home',
    title: 'Workflows',
    path: '/main',
    SubIcon: HomeIcon,
    backUrl: false
  },
  gallery: {
    key: 'gallery',
    title: 'Gallery',
    path: '/main/gallery',
    SubIcon: Image,
    backUrl: false
  },
  setting: {
    key: 'setting',
    title: 'Setting',
    path: '/main/setting',
    SubIcon: Cog,
    backUrl: false
  },
  execute: {
    key: 'execute',
    title: 'Tasks',
    path: '/main/workflow',
    SubIcon: ChevronLeft,
    backUrl: '/main'
  }
} as const

export type TRouterKey = keyof typeof RouteConf
