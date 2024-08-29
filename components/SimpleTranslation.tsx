'use client'
import { domAnimation, LazyMotion, m } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

export const SimpleTranslation: IComponent<{ deps: string[]; className?: string }> = ({
  deps,
  children,
  className
}) => {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={deps.join('_')}
        initial={{ opacity: 0, transform: 'translateY(10px) scale(0.6)' }}
        animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
        exit={{ opacity: 0, transform: 'translateY(-10px) scale(0.6)' }}
        className={twMerge('z-0', className)}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
