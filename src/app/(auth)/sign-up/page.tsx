import { Suspense } from "react";
import Loading from "@/app/(auth)/loading";

import SignUpForm from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <SignUpForm />
      </Suspense>
    </>
  );
}
