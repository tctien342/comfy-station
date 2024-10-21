'use client'

import { UserInfomation } from '@/components/UserInformation'

export default function SettingPage() {
  return (
    <div className='w-full h-full flex justify-center'>
      <div className='w-full md:hidden block'>
        <UserInfomation />
      </div>
    </div>
  )
}
