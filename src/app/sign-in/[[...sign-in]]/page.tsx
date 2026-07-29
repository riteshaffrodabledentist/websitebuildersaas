import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        fallbackRedirectUrl="/agency"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
