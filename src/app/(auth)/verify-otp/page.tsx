import Loading from "@/app/(auth)/loading";
import VerifyOTPForm from "@/components/auth/verify-otp-form";
import { Suspense } from "react";

export default function VerifyOTPPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <VerifyOTPForm />
      </Suspense>
    </>
  );
}
