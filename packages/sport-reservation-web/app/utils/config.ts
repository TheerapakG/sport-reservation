export const config = {
  oauth: {
    issuer: process.env.OAUTH_ISSUER ?? "OAUTH_ISSUER",
  },
  matching: {
    baseUrl: process.env.MATCHING_BASE_URL ?? "MATCHING_BASE_URL",
  },
};
