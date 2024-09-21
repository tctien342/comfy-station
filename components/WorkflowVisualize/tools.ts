import { Node, Edge } from '@xyflow/react'
import dagre from 'dagre'

export function applyLayout(nodes: Node[], edges: Edge[]): Node[] {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setGraph({ rankdir: 'TB' })
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 172
  const nodeHeight = 36

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const newNode = {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    } as Node
    return newNode
  })
}

export function transformNodes(workflowData: IWorkflow): Node[] {
  return Object.entries(workflowData).map(([nodeId, nodeData], index) => ({
    id: nodeId,
    type: 'default',
    data: {
      label: nodeData.info?.displayName || nodeData._meta?.title || nodeData.class_type
    },
    style: {
      color: nodeData.info?.outputNode ? '#3B82F6' : 'unset'
    },
    position: { x: 0, y: 0 } // Position will be set later
  }))
}

export function transformEdges(workflowData: IWorkflow): Edge[] {
  const edges: Edge[] = []

  Object.entries(workflowData).forEach(([targetNodeId, nodeData]) => {
    Object.entries(nodeData.inputs).forEach(([inputName, inputValue]) => {
      const references = extractNodeReferences(inputValue)

      references.forEach(([sourceNodeId]) => {
        edges.push({
          id: `e${sourceNodeId}-${targetNodeId}-${inputName}`,
          source: sourceNodeId,
          target: targetNodeId,
          label: inputName,
          animated: true
        })
      })
    })
  })

  return edges
}

export function extractNodeReferences(inputValue: TInputValue): TNodeReference[] {
  if (Array.isArray(inputValue)) {
    if (isNodeReference(inputValue)) {
      return [inputValue as TNodeReference]
    } else {
      return (inputValue as any[]).flatMap(extractNodeReferences)
    }
  }
  return []
}

export function isNodeReference(value: any): value is TNodeReference {
  return Array.isArray(value) && typeof value[0] === 'string' && typeof value[1] === 'number'
}
