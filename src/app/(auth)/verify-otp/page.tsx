import { Suspense } from "react";
import Loading from "@/app/(auth)/loading";

import VerifyOTPForm from "@/components/auth/verify-otp-form";

export default function VerifyOTPPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <VerifyOTPForm />
      </Suspense>
    </>
  );
}
