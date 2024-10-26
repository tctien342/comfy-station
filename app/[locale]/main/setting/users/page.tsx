'use client'
import { AttachmentReview } from '@/components/AttachmentReview'
import { MiniBadge } from '@/components/MiniBadge'
import { LoadingSVG } from '@/components/svg/LoadingSVG'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { EUserRole } from '@/entities/enum'
import { User } from '@/entities/user'
import { cn } from '@/lib/utils'
import { trpc } from '@/utils/trpc'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { DollarSign, Dumbbell } from 'lucide-react'
import { useMemo } from 'react'

const UserUpdater: IComponent<{
  user: User
  onRefresh?: () => void
}> = ({ user, onRefresh }) => {
  const updater = trpc.user.adminUpdate.useMutation()
  return <div></div>
}

export default function SettingUserPage() {
  const users = trpc.user.list.useQuery()

  const renderUserList = useMemo(() => {
    if (!users.data || users.isLoading) return null
    return users.data.map((user, idx) => {
      return (
        <Collapsible key={user.id}>
          <CollapsibleTrigger asChild>
            <div
              className={cn('w-full flex flex-row gap-2 p-2 btn cursor-pointer', {
                'bg-secondary/30': idx % 2 === 0
              })}
            >
              <AttachmentReview mode='avatar' data={user.avatar} className='rounded' />
              <div className='flex-1 h-full flex flex-col gap-2'>
                <div>
                  <span>{user.email}</span>
                </div>
                <div className='flex flex-wrap gap-1'>
                  <MiniBadge
                    title={EUserRole[user.role]}
                    className={cn('w-min', {
                      'bg-green-500': user.role === EUserRole.Admin,
                      'bg-blue-500': user.role === EUserRole.Editor
                    })}
                  />
                  <MiniBadge Icon={DollarSign} title='Balance' count={user.balance} />
                  <MiniBadge Icon={Dumbbell} title='Priority' count={user.weightOffset} />
                </div>
              </div>
              <CaretSortIcon className='h-4 w-4 my-auto mr-2' />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className='space-y-2 w-full'>
            <UserUpdater onRefresh={users.refetch} user={user} />
          </CollapsibleContent>
        </Collapsible>
      )
    })
  }, [users.data, users.isLoading, users.refetch])

  return (
    <div className='w-full h-full flex flex-col divide-y-[1px] overflow-x-hidden overflow-y-auto max-h-full'>
      {users.isLoading && <LoadingSVG className='w-6 h-6 m-auto' />}
      {renderUserList}
    </div>
  )
}
