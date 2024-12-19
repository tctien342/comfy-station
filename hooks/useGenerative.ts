import { trpc } from '@/utils/trpc'

export const useGenerative = () => {
  const isActive = trpc.generative.isEnabled.useQuery()
  const prompter = trpc.generative.prompt.useMutation()

  return {
    isActive: isActive.data ?? false,
    prompter
  }
}
