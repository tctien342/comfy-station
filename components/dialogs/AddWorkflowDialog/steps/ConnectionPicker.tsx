import { IMapTarget } from '@/entities/workflow'
import { FormField, FormItem, FormLabel, Form, FormControl } from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EHightlightType, useWorkflowVisStore } from '@/components/WorkflowVisualize/state'
import { useMemo } from 'react'
import { LoadableButton } from '@/components/LoadableButton'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const ConnectionPicker: IComponent<{
  workflow: IWorkflow
  connection?: IMapTarget
  onCanceled?: () => void
  onPicked?: (connection: IMapTarget) => void
}> = ({ workflow, connection, onCanceled, onPicked }) => {
  const { hightlightArr, updateHightlightArr } = useWorkflowVisStore()
  const formSchema = z.object({
    nodeName: z.string(),
    keyName: z.string(),
    mapVal: z.string()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: connection
  })
  const handleSubmit = form.handleSubmit(async (data) => {})

  const pickedNode = form.watch('nodeName')
  const pickedInput = form.watch('keyName')
  const listOfNodes = Object.keys(workflow)
  const listOfKeys = workflow[pickedNode]?.info?.inputConf

  const currentNodeValue = useMemo(() => {
    if (!pickedNode || !pickedInput) return undefined
    return workflow[pickedNode].inputs[pickedInput]
  }, [pickedInput, pickedNode, workflow])

  const handlePicking = (node: string) => {
    const oldData = hightlightArr.find((hl) => hl.type === EHightlightType.SELECTING)
    if (!oldData) {
      updateHightlightArr([...hightlightArr, { id: node, type: EHightlightType.SELECTING }])
    } else {
      updateHightlightArr(
        hightlightArr.map((hl) => {
          if (hl.type === EHightlightType.SELECTING) {
            return { id: node, type: EHightlightType.SELECTING }
          }
          return hl
        })
      )
    }
  }

  const handlePressCheck = () => {
    if (!pickedNode || !pickedInput) return
    onPicked?.({ nodeName: pickedNode, keyName: pickedInput, mapVal: `${pickedNode}.inputs.${pickedInput}` })
  }

  return (
    <Form {...form}>
      <form className='w-full h-full flex flex-col' onSubmit={handleSubmit}>
        <div className='space-y-2 h-auto'>
          <h1 className='font-semibold mb-1'>CREATE INPUT NODE</h1>
          <FormField
            name='nodeName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose node</FormLabel>
                <div className='flex gap-2'>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a node to bind input' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {listOfNodes.map((node) => {
                        const nodeInfo = workflow[node]
                        return (
                          <SelectItem onFocus={() => handlePicking(node)} key={node} value={node}>
                            <div className='flex items-center'>
                              <strong className='mr-1'>#{node}</strong>
                              {nodeInfo.info?.displayName || nodeInfo.info?.name || nodeInfo.class_type}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </FormItem>
            )}
          />
          <FormField
            name='keyName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose input key</FormLabel>
                <div className='flex gap-2'>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a input key' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(listOfKeys || {}).map((key) => {
                        return (
                          <SelectItem key={key} value={key}>
                            <div className='flex items-center'>{key}</div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </FormItem>
            )}
          />
          {!!currentNodeValue && (
            <div className='bg-secondary p-2 text-xs rounded-md break-words'>
              <strong>Current value:</strong> {currentNodeValue}
            </div>
          )}
          <div className='w-full gap-2 flex justify-end'>
            <Button type='button' onClick={onCanceled} variant='secondary' className=''>
              Cancel
              <XMarkIcon width={16} height={16} className='ml-2' />
            </Button>
            <LoadableButton type='button' disabled={!pickedNode || !pickedInput} onClick={handlePressCheck}>
              Save
              <Check width={16} height={16} className='ml-2' />
            </LoadableButton>
          </div>
        </div>
      </form>
    </Form>
  )
}
