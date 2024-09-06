import { ComponentProps, forwardRef } from 'react'

import { Button } from './ui/button'
import { LoadingSVG } from './svg/LoadingSVG'

type LoadableButton = ComponentProps<typeof Button> & { loading?: boolean }

export const LoadableButton: React.FC<LoadableButton> = forwardRef(function LoadableButton(props, ref) {
  const btn_props = {
    ...props,
    loading: undefined,
    disabled: props.disabled || props.loading
  }

  return (
    <Button ref={ref} {...btn_props}>
      {props.loading ? (
        <div className='py-1'>
          <LoadingSVG width={18} height={18} />
        </div>
      ) : (
        props.children
      )}
    </Button>
  )
})
