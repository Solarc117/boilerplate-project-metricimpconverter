require('dotenv').config()
;('use strict')
console.clear()
const { log, error } = console,
  { Octokit } = require('@octokit/core'),
  { createOAuthDeviceAuth } = require('@octokit/auth-oauth-device'),
  octokit = new Octokit({
    authStrategy: createOAuthDeviceAuth,
    auth: {
      clientType: 'oauth-app',
      clientId: process.env.CLIENT_ID,
      scopes: ['public_repo'],
      onVerification(verification) {
        // verification example
        // {
        //   device_code: "3584d83530557fdd1f46af8289938c8ef79f9dc5",
        //   user_code: "WDJB-MJHT",
        //   verification_uri: "https://github.com/login/device",
        //   expires_in: 900,
        //   interval: 5,
        // };

        console.log('Open %s', verification.verification_uri)
        console.log('Enter code: %s', verification.user_code)
      },
    },
  })

;(async () => {
  const response = octokit.request('GET /repos/{owner}/{repo}/issues', {
    owner: 'solarc117',
    repo: 'quality-assurance-projects',
  })

  log((await response).data)
})()
