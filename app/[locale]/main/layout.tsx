'use client'

const Layout: IComponent = ({ children }) => {
  return <div className='w-full h-full flex bg-white/10 dark:bg-black/10 backdrop-blur-sm border rounded-xl space-x-2 p-2'>{children}</div>
}

export default Layout
