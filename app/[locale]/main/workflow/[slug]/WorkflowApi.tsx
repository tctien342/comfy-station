import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCurrentRoute } from '@/hooks/useCurrentRoute'
import { getBaseUrl, trpc } from '@/utils/trpc'
import { useSession } from 'next-auth/react'

export const WorkflowApi: IComponent = () => {
  const { data } = useSession()
  const { slug } = useCurrentRoute()
  const user = data?.user

  const creator = trpc.token.create.useMutation()
  const listTokens = trpc.token.listByWorkflow.useQuery({ workflowId: slug! })

  const handleCopyClick = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <>
      <p className='px-4 py-2'>
        For API documents, please click{' '}
        <a href={`${getBaseUrl()}/swagger`} target='__blank' className='btn font-bold text-primary'>
          here
        </a>
      </p>
      <div className='rounded-md border m-2 overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token Key</TableHead>
              <TableHead>Owner Type</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Weight Offset</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listTokens.data?.tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className='font-mono'>
                  <div className='flex items-center gap-2'>
                    <span>{token.id.substring(0, 4)}...</span>
                  </div>
                </TableCell>
                <TableCell>
                  {token.createdBy?.id === user?.id ? (
                    <span className='text-blue-600'>Owned</span>
                  ) : (
                    <span className='text-purple-600'>Shared</span>
                  )}
                </TableCell>
                <TableCell>{token.type}</TableCell>
                <TableCell>{token.description || '-'}</TableCell>
                <TableCell>{token.balance === -1 ? 'Unlimited' : token.balance}</TableCell>
                <TableCell>{token.weightOffset}</TableCell>
                <TableCell>{new Date(token.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {token.expireAt && new Date(token.expireAt) < new Date() ? (
                    <span className='text-red-500'>Expired</span>
                  ) : (
                    <span className='text-green-500'>Active</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={async (event) => {
                      await handleCopyClick(token.id)
                      const button = event.target as HTMLButtonElement
                      button.textContent = '✓'
                      setTimeout(() => {
                        button.textContent = '📋'
                      }, 1000)
                    }}
                    className='p-1 hover:bg-gray-100 text-green-500 rounded'
                    title='Copy token ID'
                  >
                    📋
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
