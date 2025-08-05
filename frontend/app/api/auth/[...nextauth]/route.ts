export const runtime = "nodejs";
import { authOptions } from '@/lib/server/authOptions'; 
import NextAuth from "next-auth";
console.log("🧪 Imported authOptions from:", authOptions.providers?.[0]?.name);
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
