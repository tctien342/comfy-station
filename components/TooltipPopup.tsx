import { create } from 'zustand'
import { Card } from './ui/card'
import { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ITooltipStore {
  renderContent: ReactNode
  setRenderContent: (content: ReactNode) => void
}

const useTooltipStore = create<ITooltipStore>((set) => ({
  renderContent: null as ReactNode,
  setRenderContent: (content: ReactNode) => set({ renderContent: content })
}))

export const TooltipPopup: IComponent<
  {
    tooltipContent: ReactNode
  } & HTMLAttributes<HTMLDivElement>
> = ({ tooltipContent, children, ...props }) => {
  const { setRenderContent } = useTooltipStore()

  return (
    <div
      {...props}
      className={cn('cursor-pointer', props.className)}
      onMouseEnter={() => setRenderContent(tooltipContent)}
      onMouseLeave={() => setRenderContent(null)}
    >
      {children}
    </div>
  )
}

export const TooltipPopupContainer: IComponent = () => {
  const { renderContent } = useTooltipStore()
  return (
    <AnimatePresence>
      {!!renderContent && (
        <motion.div className='fixed z-10 bottom-4 right-4' exit={{ opacity: 0 }}>
          <Card className='min-w-[340px] min-h-[340px]'>{renderContent}</Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
