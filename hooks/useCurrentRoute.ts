import { RouteConf } from '@/constants/route'
import { usePathname, useRouter } from '@routing'
import { useMemo } from 'react'

export const useCurrentRoute = () => {
  const pathname = usePathname()
  const router = useRouter()

  const { route: routeConf, slug } = useMemo(() => {
    const route = Object.values(RouteConf)
      .sort((a, b) => b.path.length - a.path.length)
      .find((v) => pathname.includes(v.path))
    const slug = route ? pathname.replaceAll(route.path, '').replaceAll('/', '') : undefined
    return { route, slug }
  }, [pathname])

  return { routeConf, slug, router, pathname }
}
