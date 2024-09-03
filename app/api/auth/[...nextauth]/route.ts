import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User } from '@/entities/user'
import { MikroORMInstance } from '@/services/mikro-orm'

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
          const orm = await MikroORMInstance.getInstance().getORM()
          const em = orm.em.fork()
          const user = await em.findOne(User, { email: credentials.email }, { populate: ['password'] })

          if (user && user.password === User.hashPassword(credentials.password)) {
            return { id: user.id, email: user.email }
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      const orm = await MikroORMInstance.getInstance().getORM()
      const em = orm.em.fork()
      const user = await em.findOne(User, { email: session.user.email }, { populate: ['avatar'] })
      if (user) {
        session.user = user
      }
      return session
    }
  }
}

const handler = NextAuth(NextAuthOptions)

export { handler as GET, handler as POST }
