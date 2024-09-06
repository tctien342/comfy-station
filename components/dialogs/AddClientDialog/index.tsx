import { PlusIcon } from '@radix-ui/react-icons'
import { Button } from '../../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { InputClientInfoStep } from './InputClientInfoStep'
import { createContext, useState } from 'react'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { CheckingFeatureStep } from './CheckingFeatureStep'

export enum EImportStep {
  'INPUT_CLIENT_INFO',
  'FEATURE_CHECKING',
  'INFORMATION_CHECKING',
  'IMPORTING',
  'FINISH'
}

interface IAddClientContext {
  currentStep: EImportStep
  clientInfo?: {
    host: string
    auth: boolean
    username?: string
    password?: string
    result: {
      ping: number
      feature: {
        manager: boolean
        monitor: boolean
      }
    }
  }
  setStep?: (step: EImportStep) => void
  setClientInfo?: (info: IAddClientContext['clientInfo']) => void
}

export const AddClientDialogContext = createContext<IAddClientContext>({
  currentStep: EImportStep.INPUT_CLIENT_INFO
})

export const AddClientDialog: IComponent = () => {
  const [currentStep, setCurrentStep] = useState(EImportStep.INPUT_CLIENT_INFO)
  const [clientInfo, setClientInfo] = useState<IAddClientContext['clientInfo']>()
  return (
    <Dialog>
      <DialogTrigger className='ml-auto'>
        <Button size='icon' variant='ghost'>
          <PlusIcon width={16} height={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-full w-[calc(100vw-20px)] h-[calc(100vh-20px)] bg-background flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-base font-bold'>ADD NEW WORKER NODE</DialogTitle>
        </DialogHeader>
        <AddClientDialogContext.Provider value={{ currentStep, clientInfo, setClientInfo, setStep: setCurrentStep }}>
          <div className='w-full h-full border rounded-lg bg-secondary/20 shadow-inner flex items-center justify-center'>
            <SimpleTransitionLayout deps={[currentStep]} className='flex flex-col items-center'>
              {currentStep === EImportStep.INPUT_CLIENT_INFO && <InputClientInfoStep />}
              {currentStep === EImportStep.FEATURE_CHECKING && <CheckingFeatureStep />}
            </SimpleTransitionLayout>
          </div>
        </AddClientDialogContext.Provider>
      </DialogContent>
    </Dialog>
  )
}
