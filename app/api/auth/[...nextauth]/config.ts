import jwt from 'jsonwebtoken'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { User } from '@/entities/user'
import { getBaseUrl } from '@/utils/trpc'
import { BackendENV } from '@/env'
import { SharedStorage } from '@/services/shared'

const getUserInfomationByCredentials = async (email: string, password: string) => {
  const data = await fetch(`${getBaseUrl()}/user/credential`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BackendENV.INTERNAL_SECRET}`
    }
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error(e)
      return null
    })

  return data as User
}

const getUserInfomationByEmail = async (email: string) => {
  const data = await fetch(`${getBaseUrl()}/user/email`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BackendENV.INTERNAL_SECRET}`
    }
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error(e)
      return null
    })
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
          try {
            const user = await getUserInfomationByCredentials(credentials.email, credentials.password)
            if (user) {
              return { id: user.id, email: user.email }
            }
          } catch (e) {
            console.error(e)
          }
        }
        return null
      }
    })
  ],
  secret: BackendENV.NEXTAUTH_SECRET ?? 'secret',
  callbacks: {
    async session({ session, token }) {
      if (token.email) {
        const user = await getUserInfomationByEmail(token.email)
        if (user) {
          session.user = user
          session.accessToken = jwt.sign({ email: user.email }, BackendENV.NEXTAUTH_SECRET)
        } else {
          throw new Error('User not found')
        }
      }
      return session
    }
  }
}
