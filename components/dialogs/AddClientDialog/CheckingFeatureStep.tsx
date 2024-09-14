import { useContext } from 'react'
import { AddClientDialogContext, EImportStep } from '.'
import { SimpleInfoItem } from '@/components/SimpleInfoItem'
import { ArrowTopRightOnSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { LoadableButton } from '@/components/LoadableButton'
import { ArrowRight, ChevronLeft } from 'lucide-react'

export const CheckingFeatureStep: IComponent = () => {
  const { clientInfo, setStep } = useContext(AddClientDialogContext)

  const handleContinue = async () => {
    setStep?.(EImportStep.INFORMATION_CHECKING)
  }
  return (
    <>
      <div className='flex flex-col gap-2 max-w-sm w-full'>
        <SimpleInfoItem
          Icon={CheckIcon}
          title='Server is connected'
          className='h-14'
          iconCls='text-green-500'
          suffix={<span>{clientInfo?.result.ping.toFixed(1)}ms</span>}
        />
        <SimpleInfoItem
          Icon={clientInfo?.result.feature.manager ? CheckIcon : XMarkIcon}
          title={
            clientInfo?.result.feature.manager ? 'ComfyUI - Manager is Installed' : 'ComfyUI - Manager is not Installed'
          }
          className='h-14'
          iconCls='text-green-500'
          suffix={
            <Button
              onClick={() => window.open('https://github.com/ltdrdata/ComfyUI-Manager', '_blank')}
              size='icon'
              variant='outline'
              className=''
            >
              <ArrowTopRightOnSquareIcon width={16} height={16} />
            </Button>
          }
        />
        <SimpleInfoItem
          Icon={clientInfo?.result.feature.monitor ? CheckIcon : XMarkIcon}
          title={
            clientInfo?.result.feature.monitor
              ? 'ComfyUI - Crystool is Installed'
              : 'ComfyUI - Crystool is not Installed'
          }
          iconCls='text-green-500'
          className='h-14'
          suffix={
            <Button
              onClick={() => window.open('https://github.com/crystian/ComfyUI-Crystools', '_blank')}
              size='icon'
              variant='outline'
              className=''
            >
              <ArrowTopRightOnSquareIcon width={16} height={16} />
            </Button>
          }
        />
      </div>
      <div className='flex gap-2 w-full justify-center mt-4'>
        <Button onClick={() => setStep?.(EImportStep.INPUT_CLIENT_INFO)} variant='secondary' className=''>
          Back
          <ChevronLeft width={16} height={16} className='ml-2' />
        </Button>
        <LoadableButton onClick={handleContinue}>
          Continue
          <ArrowRight width={16} height={16} className='ml-2' />
        </LoadableButton>
      </div>
      <div className='flex flex-col gap-2 w-full justify-center mt-4'>
        <p className='text-sm font-normal text-zinc-400 max-w-lg text-center'>
          Crystools is needed for tracking node’s resources, without it, you can not track GPU CPU and HDD.
        </p>
        <p className='text-sm font-normal text-zinc-400 max-w-lg text-center'>
          ComfyUI-Manager is used for managing extensions and model files.
        </p>
      </div>
    </>
  )
}
