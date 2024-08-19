import { defineConfig } from '@mikro-orm/better-sqlite'
import { Client } from './entities/client'
import { ClientStatusEvent } from './entities/client_status_event'
import { ClientMonitorEvent } from './entities/client_monitor_event'
import { ClientMonitorGpu } from './entities/client_monitor_gpu'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import { TokenPermission } from './entities/token_permission'
import { Token } from './entities/token'
import { User } from './entities/user'
import { WorkflowEditEvent } from './entities/workflow_edit_event'
import { Workflow } from './entities/workflow'
import { WorkflowTask } from './entities/workflow_task'
import { WorkflowTaskEvent } from './entities/workflow_task_event'
import { Extension } from './entities/extension'

export default defineConfig({
  entities: [
    ClientMonitorGpu,
    ClientMonitorEvent,
    ClientStatusEvent,
    Extension,
    User,
    Token,
    Client,
    Workflow,
    TokenPermission,
    WorkflowEditEvent,
    WorkflowTask,
    WorkflowTaskEvent
  ],
  dbName: 'comfyui.manager.db',
  metadataProvider: TsMorphMetadataProvider
})
