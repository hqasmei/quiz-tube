export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex', // This is hardcoded name coming from Clerk. This indicates that JWT token is created for "convex" application
    },
  ],
};
