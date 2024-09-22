import { IMapTarget } from '@/entities/workflow'
import { FormField, FormItem, FormLabel, Form, FormControl } from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { EHightlightType, useWorkflowVisStore } from '@/components/WorkflowVisualize/state'
import { useEffect } from 'react'

export const ConnectionPicker: IComponent<{
  workflow: IWorkflow
  connection?: IMapTarget
  onPicked?: (connection: IMapTarget) => void
}> = ({ workflow, connection, onPicked }) => {
  const { hightlightArr, updateHightlightArr } = useWorkflowVisStore()
  const formSchema = z.object({
    nodeName: z.string(),
    keyName: z.string(),
    mapVal: z.string()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  })
  const handleSubmit = form.handleSubmit(async (data) => {})

  const pickedNode = form.watch('nodeName')
  const listOfNodes = Object.keys(workflow)
  const listOfKeys = workflow[pickedNode]?.info?.inputConf

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
        </div>
      </form>
    </Form>
  )
}
