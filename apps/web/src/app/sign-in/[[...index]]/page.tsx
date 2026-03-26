// app/sign-in/[[...index]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <SignIn forceRedirectUrl="/auth-redirect" />
    </div>
  );
}