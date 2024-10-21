import { ChevronLeft, Cog, HomeIcon, Image } from 'lucide-react'

export const RouteConf = {
  home: {
    key: 'home',
    title: 'Workflows',
    path: '/main',
    SubIcon: HomeIcon,
    backUrl: false,
    onNav: true
  },
  gallery: {
    key: 'gallery',
    title: 'Gallery',
    path: '/main/gallery',
    SubIcon: Image,
    backUrl: false,
    onNav: true
  },
  setting: {
    key: 'setting',
    title: 'Setting',
    path: '/main/setting',
    SubIcon: Cog,
    backUrl: false,
    onNav: true
  },
  execute: {
    key: 'execute',
    title: 'Tasks',
    path: '/main/workflow',
    SubIcon: ChevronLeft,
    backUrl: '/main',
    onNav: false
  }
} as const

export type TRouterKey = keyof typeof RouteConf
