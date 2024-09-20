import { useContext, useMemo } from 'react'
import { AddWorkflowDialogContext, EImportStep } from '.'
import { cn } from '@/lib/utils'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { WorkflowInformation } from './steps/WorkflowInformation'
import { MappingInput } from './steps/MappingInput'

export const WorkflowConfiguration: IComponent = () => {
  const { currentStep } = useContext(AddWorkflowDialogContext)
  const renderSteps = useMemo(() => {
    return Array.from({ length: 4 }).map((_, index) => {
      return (
        <div
          key={index}
          className={cn({
            'text-foreground': index === currentStep - 1,
            'text-border': index !== currentStep - 1
          })}
        >
          STEP {index + 1}
        </div>
      )
    })
  }, [currentStep])

  const label = {
    [EImportStep.S0_UPLOAD_WORKFLOW]: '',
    [EImportStep.S1_WORKFLOW_INFO]: 'WORKFOW INFORMATION',
    [EImportStep.S2_MAPPING_INPUT]: 'MAP INPUT NODE',
    [EImportStep.S3_MAPPING_OUTPUT]: 'MAP OUTPUT NODE',
    [EImportStep.S4_FINALIZE]: 'FINALIZE'
  }[currentStep]

  return (
    <div className='w-full h-full border rounded-lg bg-secondary/20 shadow-inner p-2'>
      <div className='w-full flex flex-col'>
        <div className='flex gap-1 text-sm font-medium'>{renderSteps}</div>
        <h1 className='font-semibold'>{label}</h1>
        <SimpleTransitionLayout deps={[currentStep]} className='w-full overflow-hidden'>
          {currentStep === EImportStep.S1_WORKFLOW_INFO && <WorkflowInformation />}
          {currentStep === EImportStep.S2_MAPPING_INPUT && <MappingInput />}
        </SimpleTransitionLayout>
      </div>
    </div>
  )
}
