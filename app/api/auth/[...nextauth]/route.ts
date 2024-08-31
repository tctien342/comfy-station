import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { User } from '@/entities/user'
import { MikroORMInstance } from '@/services/mikro-orm'

const handler = NextAuth({
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
    }
  }
})

export { handler as GET, handler as POST }
