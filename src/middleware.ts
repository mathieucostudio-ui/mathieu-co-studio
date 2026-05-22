import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Intercept all paths except Next.js internals, static files and API routes
  matcher: ['/((?!_next|_vercel|api|.*\\..*).*)'],
};
