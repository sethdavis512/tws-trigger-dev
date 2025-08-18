import type { Route } from "./+types/portal";
import { CustomerPortal } from "@polar-sh/remix";
import { auth } from "~/lib/auth.server";

export const loader = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  getCustomerId: async (event) => {
    // User is guaranteed to be authenticated by parent layout
    const session = await auth.api.getSession({ headers: event.headers });
    const user = session!.user;
    return user.polarCustomerId || user.id;
  }
});