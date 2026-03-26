import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AuthRedirect() {
  const { userId, sessionClaims } = await auth();

  console.log("AUTH REDIRECT - userId:", userId);
  console.log("AUTH REDIRECT - sessionClaims:", JSON.stringify(sessionClaims));

  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as any)?.role;
  console.log("AUTH REDIRECT - role:", role);

  redirect(role === "admin" ? "/admin" : "/");
}