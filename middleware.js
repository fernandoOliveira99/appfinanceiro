export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/reports/:path*", "/settings/:path*", "/profile/:path*"],
};
