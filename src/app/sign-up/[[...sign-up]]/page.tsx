import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        fallbackRedirectUrl="/agency"
        signInUrl="/sign-in"
      />
    </main>
  );
}
