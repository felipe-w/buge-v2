import Loading from "@/app/loading";
import SignUpForm from "@/components/auth/sign-up-form";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <SignUpForm />
      </Suspense>
    </>
  );
}
