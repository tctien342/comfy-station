export type TWorkflowProgressMessage =
  | { key: 'init' }
  | { key: 'loading' }
  | { key: 'start' }
  | { key: 'progress'; data: { node: number; max: number; value: number } }
  | { key: 'preview'; data: { blob: Blob } }
  | {
      key: 'finished'
      data: {
        output: {
          [key: string]: { info: import('@/entities/workflow').IMapperOutput; data: any }
        }
      }
    }
  | { key: 'failed'; detail: string }
