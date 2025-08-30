import type { Route } from "./+types/checkout";
import { Checkout } from "@polar-sh/remix";
import { auth } from "~/lib/auth.server";

export const loader = async (args: Route.LoaderArgs) => {
  // User is guaranteed to be authenticated by parent layout
  const session = await auth.api.getSession({ headers: args.request.headers });
  const user = session!.user;
  
  return Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `/billing/success?user=${user.id}`,
    server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
    theme: "dark"
  })(args);
};