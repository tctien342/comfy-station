import { cn } from '@/lib/utils'

export const MiniBadge: IComponent<{
  dotClassName: string
  title: string
  count?: number
}> = ({ dotClassName, title, count }) => {
  return (
    <div className='flex gap-1 h-min justify-center items-center text-xs border rounded px-2 py-1 shadow'>
      <div className={cn('w-2 h-2 rounded-full', dotClassName)} />
      <span>{title}</span>
      {count !== undefined && <span>{count}</span>}
    </div>
  )
}
