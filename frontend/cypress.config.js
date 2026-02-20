const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    OPTIMUM_LARGE_VIDEO: process.env.OPTIMUM_LARGE_VIDEO || false
  },
  e2e: {
    baseUrl: 'https://ppacilyoncentre.com',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    experimentalRunAllSpecs: false
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 30000,
  chromeWebSecurity: false
})
