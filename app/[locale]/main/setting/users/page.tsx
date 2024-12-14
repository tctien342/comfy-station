'use client'
import { AttachmentReview } from '@/components/AttachmentReview'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EUserRole } from '@/entities/enum'
import { EGlobalEvent, useGlobalEvent } from '@/hooks/useGlobalEvent'
import { trpc } from '@/utils/trpc'
import { DollarSign, Dumbbell, Play, Settings2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserUpdater } from './UserUpdater'

export default function SettingUserPage() {
  const users = trpc.user.list.useQuery()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useGlobalEvent(EGlobalEvent.RLOAD_USER_LIST, () => users.refetch())

  const sortedUsers = useMemo(() => {
    if (!users.data) return []
    return [...users.data].sort((a, b) => b.user.role - a.user.role)
  }, [users.data])

  if (users.isLoading) {
    return <LoadingSVG className='w-6 h-6 m-auto' />
  }

  return (
    <div className='w-full h-full space-y-4'>
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserUpdater
              user={sortedUsers.find((u) => u.user.id === selectedUser)!.user}
              onRefresh={() => {
                users.refetch()
                setSelectedUser(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map(({ user, runCount }) => {
            const shortName = user.email.split('@')[0].slice(0, 2).toUpperCase()

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <AttachmentReview
                      mode='avatar'
                      shortName={shortName}
                      data={user.avatar}
                      className='rounded w-8 h-8'
                    />
                    <div className='flex flex-col'>
                      <span className='font-medium'>{user.email}</span>
                      <span className='text-xs text-muted-foreground'>ID: {user.id.split('-').pop()}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <MiniBadge
                    title={EUserRole[user.role]}
                    className={cn('w-min', {
                      'bg-green-500 text-white border-none': user.role === EUserRole.Admin,
                      'bg-blue-500 text-white border-none': user.role === EUserRole.Editor,
                      'bg-black text-white border-none': user.role === EUserRole.User
                    })}
                  />
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    <MiniBadge Icon={DollarSign} title='Balance' count={user.balance} />
                    <MiniBadge Icon={Dumbbell} title='Priority' count={user.weightOffset} />
                    <MiniBadge Icon={Play} title='Tasks' count={`${runCount}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant='ghost' size='icon' onClick={() => setSelectedUser(user.id)}>
                    <Settings2 className='w-4 h-4' />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
