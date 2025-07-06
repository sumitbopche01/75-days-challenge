// src/pages/api/auth/[...nextauth].ts
// NextAuth API route for Google authentication
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

export default NextAuth(authOptions); 