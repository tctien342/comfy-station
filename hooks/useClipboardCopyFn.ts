import { useToast } from './useToast'

export const useClipboardCopyFn = () => {
  const { toast } = useToast()
  const copy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: 'Content copied to clipboard'
      })
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return { copy }
}
