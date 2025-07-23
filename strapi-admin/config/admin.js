module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'trxguardian-admin-secret-key'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'trxguardian-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'trxguardian-transfer-token-salt'),
    },
  },
});