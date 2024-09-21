import { useContext, useMemo } from 'react'
import { AddWorkflowDialogContext, EImportStep } from '.'
import { cn } from '@/lib/utils'
import { SimpleTransitionLayout } from '@/components/SimpleTranslation'
import { WorkflowInformation } from './steps/WorkflowInformation'
import { MappingInput } from './steps/MappingInput'
import { ScrollArea } from '@/components/ui/scroll-area'

export const WorkflowConfiguration: IComponent = () => {
  const { currentStep } = useContext(AddWorkflowDialogContext)
  const renderSteps = useMemo(() => {
    return Array.from({ length: 4 }).map((_, index) => {
      return (
        <div
          key={index}
          className={cn('transition-all duration-500', {
            'text-foreground': index === currentStep - 1,
            'text-border': index !== currentStep - 1
          })}
        >
          STEP {index + 1}
        </div>
      )
    })
  }, [currentStep])

  return (
    <div className='w-full h-full border rounded-lg bg-secondary/20 shadow-inner'>
      <div className='w-full flex flex-col h-full'>
        <div className='flex gap-1 text-sm font-medium px-2 pt-2'>{renderSteps}</div>
        <SimpleTransitionLayout deps={[currentStep]} className='w-full h-full relative'>
          <div className='absolute top-0 left-0 w-full h-full'>
            <ScrollArea className='w-full h-full'>
              <div className='min-h-full w-full px-2 pb-2'>
                {currentStep === EImportStep.S1_WORKFLOW_INFO && <WorkflowInformation />}
                {currentStep === EImportStep.S2_MAPPING_INPUT && <MappingInput />}
              </div>
            </ScrollArea>
          </div>
        </SimpleTransitionLayout>
      </div>
    </div>
  )
}
