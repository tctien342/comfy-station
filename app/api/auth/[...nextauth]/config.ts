import jwt from 'jsonwebtoken'
import { MikroORMInstance } from '@/services/mikro-orm'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { User } from '@/entities/user'
import { getBaseUrl } from '@/utils/trpc'

const getUserInfomationByCredentials = async (email: string, password: string) => {
  const data = await fetch(`${getBaseUrl()}/user/credential`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json())
  return data as User
}

const getUserInfomationByJWT = async (token: string) => {
  const data = await fetch(`${getBaseUrl()}/user/jwt`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json())
  return data as User
}

export const NextAuthOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials) {
          const user = await getUserInfomationByCredentials(credentials.email, credentials.password)
          if (user) {
            return { id: user.id, email: user.email }
          }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET ?? 'secret',
  callbacks: {
    async jwt({ token }) {
      const accessToken = jwt.sign({ email: token.email }, process.env.NEXTAUTH_SECRET ?? 'secret')
      return { ...token, accessToken }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (session.accessToken) {
        const user = await getUserInfomationByJWT(session.accessToken)
        if (user) {
          session.user = user
        }
      }
      return session
    }
  }
}
