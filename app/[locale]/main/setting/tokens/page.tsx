'use client'

import { LoadableButton } from '@/components/LoadableButton'
import { TooltipPopup } from '@/components/TooltipPopup'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/useToast'
import { getBaseUrl, trpc } from '@/utils/trpc'
import { Pencil, RefreshCcwDot, Trash2 } from 'lucide-react'
import { TokenPopup } from './TokenPopup'
import { usePathname, useRouter } from 'next/navigation'
import { dispatchGlobalEvent, EGlobalEvent } from '@/hooks/useGlobalEvent'

export default function TokenPage() {
  const router = useRouter()
  const pathName = usePathname()
  const tokens = trpc.token.list.useQuery()

  const { toast } = useToast()
  const reRoller = trpc.token.reroll.useMutation()
  const destroyer = trpc.token.destroy.useMutation()

  const handleCopyClick = async (tokenId: string) => {
    try {
      await navigator.clipboard.writeText(tokenId)
      toast({
        title: 'Token ID copied to clipboard'
      })
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className='w-full h-full flex flex-col'>
      <TokenPopup
        onRefresh={() => {
          tokens.refetch()
        }}
      />
      <div className='p-2'>
        <h1 className='font-bold text-xl'>API Token Management</h1>
        <p className='text-gray-500'>
          API tokens are used to authenticate and authorize requests to the API. You can create, delete, and manage your
          tokens here.
        </p>
        <p className='text-gray-500'>
          For more information on how to use the API, please refer to the
          <a href={`${getBaseUrl()}/swagger`} target='__blank' className='text-blue-500 underline px-1'>
            API documentation
          </a>
          .
        </p>
      </div>
      <div className='flex-1 relative border-t'>
        <Table divClassname='absolute top-0 left-0 w-full h-full pb-10'>
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
                <TableCell
                  className='cursor-pointer'
                  onDoubleClick={async () => await handleCopyClick(token.id)}
                  title='Double click to copy'
                >
                  {token.id.slice(-8)}...
                </TableCell>
                <TableCell>{token.description ?? '-'}</TableCell>
                <TableCell>{token.type}</TableCell>
                <TableCell>
                  {token.balance === -1
                    ? token.createdBy.balance === -1
                      ? 'Unlimited'
                      : `${token.createdBy.balance} (Synced)`
                    : token.balance}
                </TableCell>
                <TableCell>
                  <TooltipPopup
                    tooltipContent={
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Workflow Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {token.grantedWorkflows?.map((workflow) => (
                            <TableRow key={workflow.workflow.id}>
                              <TableCell>{workflow.workflow.name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    }
                  >
                    {token.isMaster ? 'All' : token.grantedWorkflows?.length}
                  </TooltipPopup>
                </TableCell>
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
                    loading={reRoller.isPending}
                    onClick={() => reRoller.mutateAsync({ tokenId: token.id }).then(() => tokens.refetch())}
                    size='icon'
                    variant='outline'
                    title='Reroll token'
                  >
                    <RefreshCcwDot size={14} />
                  </LoadableButton>
                  <Button
                    size='icon'
                    variant='outline'
                    onClick={() => {
                      // Navigate to the edit page for the token
                      router.push(`${pathName}?token_id=${token.id}`)
                      dispatchGlobalEvent(EGlobalEvent.BTN_CREATE_TOKEN)
                    }}
                    className='p-1 hover:bg-gray-100 rounded'
                    title='Edit token'
                  >
                    <Pencil size={14} />
                  </Button>
                  <LoadableButton
                    loading={destroyer.isPending}
                    onClick={() => destroyer.mutateAsync({ tokenId: token.id }).then(() => tokens.refetch())}
                    size='icon'
                    variant='destructive'
                    title='Delete token'
                  >
                    <Trash2 size={14} />
                  </LoadableButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
