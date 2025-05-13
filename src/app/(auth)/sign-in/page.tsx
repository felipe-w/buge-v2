import { Suspense } from "react";
import Loading from "@/app/(auth)/loading";

import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <SignInForm />
      </Suspense>
    </>
  );
}
