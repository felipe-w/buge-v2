import Loading from "@/app/loading";
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
