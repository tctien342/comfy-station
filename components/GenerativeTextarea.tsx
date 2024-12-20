import { useGenerative } from '@/hooks/useGenerative'
import { Textarea } from './ui/textarea'
import { LoadableButton } from './LoadableButton'
import { useId } from 'react'
import { MagicWandIcon } from '@radix-ui/react-icons'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export interface IGenerativeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  generative?: boolean
  instruction?: string
}

export const GenerativeTextarea: IComponent<IGenerativeTextareaProps> = ({ generative, instruction, ...props }) => {
  const id = useId()
  const { toast } = useToast()
  const { isActive, prompter } = useGenerative()
  return (
    <div className='relative'>
      <Textarea
        id={id}
        {...props}
        className={cn(props.className, {
          'pb-10': isActive && generative
        })}
      />
      {isActive && generative && (
        <LoadableButton
          loading={prompter.isPending}
          title='Use AI to regenerate this input'
          className='absolute bottom-2 right-2'
          variant='outline'
          onClick={() => {
            const ele = document.getElementById(id) as HTMLTextAreaElement
            if (!ele) return
            const content = ele.value
            prompter
              .mutateAsync({
                describe: content ?? props.placeholder,
                requirement: instruction ?? ''
              })
              .then((res) => {
                const output = res.output
                ele.value = output
                const nativeInputEvent = new Event('input', { bubbles: true })
                const reactChangeEvent = new Event('change', { bubbles: true })
                ele.dispatchEvent(nativeInputEvent)
                ele.dispatchEvent(reactChangeEvent)
                // Trigger React's synthetic onChange event
                props.onChange?.({
                  target: ele,
                  currentTarget: ele
                } as React.ChangeEvent<HTMLTextAreaElement>)
              })
              .catch((err) => {
                toast({
                  title: 'Failed to regenerate new input',
                  variant: 'destructive'
                })
              })
          }}
          size='icon'
        >
          <MagicWandIcon className='w-4 h-4' />
        </LoadableButton>
      )}
    </div>
  )
}
