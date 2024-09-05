import { ReactNode } from 'react'

export const MonitoringStat: IComponent<{
  icon: ReactNode
  title: string
  value: string
  minWidth?: number
}> = ({ icon, title, value, minWidth = 86 }) => {
  return (
    <div className='flex gap-1 whitespace-nowrap items-center text-xs font-normal' style={{ minWidth }}>
      {icon}
      <div className='flex-auto'>{title}</div>
      {value}
    </div>
  )
}
