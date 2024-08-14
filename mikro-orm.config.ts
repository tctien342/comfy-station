import { defineConfig } from '@mikro-orm/better-sqlite'
import { Client } from './entities/client'
import { ClientStatusEvent } from './entities/client_status_event'
import { ClientMonitorEvent } from './entities/client_monitor_event'
import { GpuMonitorEvent } from './entities/client_monitor_gpu'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { TokenPermission } from './entities/token_permission'
import { Token } from './entities/token'
import { User } from './entities/user'
import { WorkflowEditEvent } from './entities/workflow_edit_event'
import { Workflow } from './entities/workflow'
import { WorkflowTask } from './entities/workflow_task'
import { WorkflowTaskEvent } from './entities/workflow_task_event'

export default defineConfig({
  entities: [
    User,
    Token,
    Client,
    Workflow,
    TokenPermission,
    GpuMonitorEvent,
    ClientStatusEvent,
    ClientMonitorEvent,
    WorkflowEditEvent,
    WorkflowTask,
    WorkflowTaskEvent
  ],
  dbName: 'comfyui.manager.db',
  metadataProvider: TsMorphMetadataProvider
})
