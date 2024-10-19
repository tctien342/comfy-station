import { ChevronLeft, HomeIcon } from 'lucide-react'

export const RouteConf = {
  home: {
    key: 'home',
    title: 'Workflows',
    path: '/main',
    SubIcon: HomeIcon,
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
