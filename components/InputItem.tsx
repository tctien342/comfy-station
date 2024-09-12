import { IconProps } from '@radix-ui/react-icons/dist/types'
import { Code } from 'lucide-react'
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

export const InputItem: IComponent<{
  title: string
  description?: string
  value?: string
  /**
   * Only used when inputType is 'input' or 'textarea'
   */
  placeholder?: string
  /**
   * @default readonly
   */
  inputType?: 'readonly' | 'input' | 'textarea'
  onChange?: (str: string) => void
  Icon?:
    | ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
    | ForwardRefExoticComponent<
        Omit<SVGProps<SVGSVGElement>, 'ref'> & {
          title?: string
          titleId?: string
        } & RefAttributes<SVGSVGElement>
      >
}> = ({ title, description, value, inputType = 'readonly', Icon, onChange, placeholder }) => {
  const ICO = Icon || Code
  return (
    <div className='flex flex-row gap-2'>
      <div className='p-2'>
        <ICO width={18} height={18} />
      </div>
      <div className='flex flex-col flex-auto'>
        <h1 className='text-sm font-semibold'>{title}</h1>
        {!!description && <p className='text-xs text-secondary-foreground'>{description}</p>}
        {inputType === 'readonly' && <span className='text-xs'>{value}</span>}
        {inputType === 'input' && (
          <Input
            value={value}
            className='mt-1'
            placeholder={placeholder}
            onChange={(e) => {
              if (onChange) onChange(e.target.value)
            }}
          />
        )}
        {inputType === 'textarea' && (
          <Textarea
            value={value}
            className='mt-1'
            placeholder={placeholder}
            onChange={(e) => {
              if (onChange) onChange(e.target.value)
            }}
          />
        )}
      </div>
    </div>
  )
}
