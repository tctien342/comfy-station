import AttachmentService from './services/attachment'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    /**
     * Server-side instrumentation
     * Initialize the services that need to be started
     */
    const { ComfyPoolInstance } = await import('./services/comfyui')
    const { MikroORMInstance } = await import('./services/mikro-orm')

    await MikroORMInstance.getInstance().getORM()
    ComfyPoolInstance.getInstance()
    AttachmentService.getInstance()
  }
}
