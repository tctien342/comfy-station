'use client'

import { LoadableButton } from '@/components/LoadableButton'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table'
import { trpc } from '@/utils/trpc'
import { RefreshCcwDot, Trash2 } from 'lucide-react'

const TokenPage: IComponent = () => {
  const tokens = trpc.token.list.useQuery()

  const reroller = trpc.token.reroll.useMutation()
  const destroyer = trpc.token.destroy.useMutation()

  const handleCopyClick = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token Key</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Workflows</TableHead>
          <TableHead>Weight Offset</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.data?.map((token) => (
          <TableRow key={token.id}>
            <TableCell>{token.id.slice(-8)}...</TableCell>
            <TableCell>{token.description ?? '-'}</TableCell>
            <TableCell>{token.type}</TableCell>
            <TableCell>{token.balance === -1 ? 'Unlimited' : token.balance}</TableCell>
            <TableCell>{token.grantedWorkflows?.length}</TableCell>
            <TableCell>{token.weightOffset}</TableCell>
            <TableCell>{token.createdBy.email}</TableCell>
            <TableCell>
              {token.expireAt && new Date(token.expireAt) < new Date() ? (
                <span className='text-red-500'>Expired</span>
              ) : (
                <span className='text-green-500'>Active</span>
              )}
            </TableCell>
            <TableCell className='flex gap-2'>
              <Button
                size='icon'
                variant='outline'
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
              </Button>
              <LoadableButton
                loading={reroller.isPending}
                onClick={() => reroller.mutateAsync({ tokenId: token.id }).then(() => tokens.refetch())}
                size='icon'
                variant='outline'
              >
                <RefreshCcwDot size={14} />
              </LoadableButton>
              <LoadableButton
                loading={destroyer.isPending}
                onClick={() => destroyer.mutateAsync({ tokenId: token.id }).then(() => tokens.refetch())}
                size='icon'
                variant='destructive'
              >
                <Trash2 size={14} />
              </LoadableButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TokenPage
