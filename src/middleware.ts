import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const middleware = createMiddleware(routing);

export default middleware;

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
