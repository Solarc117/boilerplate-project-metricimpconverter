'use strict'
const { log } = console

const { Router } = require('express'),
  { Octokit } = require('@octokit/core'),
  { createOAuthDeviceAuth } = require('@octokit/auth-oauth-device'),
  // @ts-ignore
  router = new Router(),
  octokit = new Octokit({
    authStrategy: createOAuthDeviceAuth,
    auth: {
      clientType: 'oauth-app',
      clientId: process.env.CLIENT_ID,
      scopes: ['public_repo'],
      onVerification({ verification_uri, user_code }) {
        // verification example
        // {
        //   device_code: "3584d83530557fdd1f46af8289938c8ef79f9dc5",
        //   user_code: "WDJB-MJHT",
        //   verification_uri: "https://github.com/login/device",
        //   expires_in: 900,
        //   interval: 5,
        // };
        log('Open', verification_uri)
        log('Enter code', user_code)
      },
    },
  })

module.exports = router
