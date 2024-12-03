'use client'

import { useContext } from 'react'
import WorkflowGallery from './Gallery'
import { WorkflowDetailContext } from '../layout'
import { WorkflowApi } from './WorkflowApi'

export default function WorkflowDetail() {
  const { viewTab } = useContext(WorkflowDetailContext)

  if (viewTab === 'api') {
    return <WorkflowApi />
  }

  return <WorkflowGallery />
}
