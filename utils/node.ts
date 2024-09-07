function toReadableName(nodeName: string): string {
  // Strip known prefixes such as 'nodes', 'comfy_extras.', 'custom_nodes.'
  const strippedName = nodeName
    .replace(/^nodes\./, '')
    .replace(/^comfy_extras\./, '')
    .replace(/^custom_nodes\./, '')

  // Replace underscores and hyphens with spaces
  const spacedName = strippedName.replace(/[_-]/g, ' ')

  // Capitalize each word
  const readableName = spacedName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return readableName
}

function transformNodeNames(nodeNames: string[]): string[] {
  return nodeNames.map(toReadableName)
}

export { toReadableName, transformNodeNames }
