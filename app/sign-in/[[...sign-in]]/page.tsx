import { SignIn } from "@clerk/nextjs";
import AuthMarketingPanel from "@/components/auth/auth-marketing-panel";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-base">
      <AuthMarketingPanel />
      <div className="w-1/2 flex items-center justify-center p-8">
        <SignIn />
      </div>
    </div>
  );
}
