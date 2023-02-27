import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials';
import { Client } from 'postmark'
const FormData = require('form-data');
import { siteConfig } from '@/config/site'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'


const postmarkClient = new Client(process.env.POSTMARK_API_TOKEN)

export const authOptions: NextAuthOptions = {
  // huh any! I know.
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      id: "virtuous",
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Virtuous CMS',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: 'email',
          type: 'email',
          placeholder: 'jsmith@example.com',
        },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const payload = {
          email: credentials.email,
          password: credentials.password,
        };
        console.log(req)
        const form = new FormData();
        form.append('email', credentials.email);
        form.append('password', credentials.password);
        console.log(credentials); 
        
        const res = await fetch('https://api.virtuoussoftware.com/Token', {
          method: 'POST',
          body: 'grant_type=password&username=' + credentials.email + '&password=' + credentials.password,
          mode: "no-cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "form-data",
          },
        });
        console.log('after form')
       
        const user = await res.json();
        console.log(user);
        if (!res.ok) {
          throw new Error(user.message);
        }
        // If no error and we have user data, return it
        if (res.ok && user) {
          // save some data 
          const dbUser = await db.user.findFirst({
            where: {
              email: credentials.email,
            },
          })
          console.log('finding user')

          if (!dbUser) {
            console.log('no user found'); 
            // create new user and account (with tokens)
      
            const newUser = await db.user.create({
              data: {
                email: credentials.email,
                emailVerified: new Date(),
                name: user.userName,
              },
              select: {
                id: true,
              },
            })
            

            let accountData: Prisma.AccountUncheckedCreateInput = 
              {
                userId: newUser.id,
                type: 'oauth', 
                provider: 'virtuous', 
                providerAccountId: user.userName,
                refresh_token: user.refresh_token,
                access_token: user.access_token,
                expires_at: user.expires_in,
                token_type: 'bearer',
              }; 

              console.log('');
            const newAccount = await db.account.create({
              data: accountData,
              select: {
                id: true,
              },
            })
            } else { 
              console.log('updating user'); 
                // update account (with tokens)
                const updatedAccount = await db.account.updateMany({
                  where: {
                    userId: dbUser.id,
                    type: 'oauth', 
                    provider: 'virtuous',
                  },
                  data: {
                    access_token: user.access_token,
                    refresh_token: user.refresh_token,
                    expires_at: user.expires_in,
                    token_type: 'bearer',
                  },
                })
      
            }
            // console.log('Here is the user')
            user.id = dbUser.id; 
            user.email=credentials.email; 
            // console.log(user)
          return user;
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
    
  ],
  callbacks: {
    async session({ token, session, user }) {
      // console.log('token')
      // console.log(token)
      // console.log('session')
      // console.log(session)
      // console.log('user-session')
      // console.log(user)
      if (token) {

        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }

      return session
    },
    async jwt({ token, user }) {
      // console.log('jwt-token')
      // console.log(token)
      // console.log('jwt-user')
      // console.log(user)
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email ,
        },
      })
      // console.log("In JWT DB USER")
      // console.log(dbUser)
      if (!dbUser) {
        token.id = user.id
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
}
