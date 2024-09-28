export type TWorkflowProgressMessage =
  | { key: 'init' }
  | { key: 'loading' }
  | { key: 'start' }
  | { key: 'progress'; data: { node: number; max: number; value: number } }
  | { key: 'preview'; data: { blob64: string } }
  | { key: 'downloading_output' }
  | { key: 'uploading_output' }
  | {
      key: 'finished'
      data: {
        output: {
          [key: string]: { info: import('@/entities/workflow').IMapperOutput; data: any }
        }
      }
    }
  | { key: 'failed'; detail: string }
