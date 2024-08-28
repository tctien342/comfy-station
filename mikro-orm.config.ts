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
import { Extension } from './entities/client_extension'
import { ClientActionEvent } from './entities/client_action_event'
import { Job } from './entities/job'
import { JobItem } from './entities/job_item'
import { TokenShared } from './entities/token_shared'
import { Resource } from './entities/client_resource'
import { UserNotification } from './entities/user_notifications'
import { WorkflowAttachment } from './entities/workflow_attachment'

export default defineConfig({
  entities: [
    ClientActionEvent,
    ClientMonitorGpu,
    ClientMonitorEvent,
    ClientStatusEvent,
    Client,
    Extension,
    Resource,
    Job,
    JobItem,
    User,
    UserNotification,
    Token,
    TokenShared,
    TokenPermission,
    Workflow,
    WorkflowTask,
    WorkflowTaskEvent,
    WorkflowEditEvent,
    WorkflowAttachment
  ],
  dbName: 'comfyui.manager.db',
  metadataProvider: TsMorphMetadataProvider
})
