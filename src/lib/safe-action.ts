import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { createSafeActionClient } from "next-safe-action";

import { auth } from "./auth";

export const authActionClient = createSafeActionClient().use(async ({ next }) => {
  const authData = await auth.api.getSession({ headers: await headers() });

  if (!authData) {
    return unauthorized();
  }

  return next({
    ctx: { auth: authData },
  });
});
