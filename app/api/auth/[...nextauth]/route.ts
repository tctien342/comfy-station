import NextAuth from 'next-auth'
import { NextAuthOptions } from './config'

const handler = NextAuth(NextAuthOptions)

export { handler as GET, handler as POST }
