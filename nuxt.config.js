const colors = require ( 'vuetify/es5/util/colors' ).default

module.exports = {
  env: {
    baseUrl: process.env.BASE_URL || 'localhost:3000',
    computerVisionSubscriptionKey: process.env.COMPUTER_VISION_SUBSCRIPTION_KEY,
    computerSpeechServiceResource: process.env.SPEECH_SERVICE_RESOURCE_NAME,
    speechServiceSubscriptionKey: process.envSPEECH_SERVICE_SUBSCRIPTION_KEY,
    computerVisionEndpoint: process.env.COMPUTER_VISION_ENDPOINT || 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/',
    speechServiceEndpoint: process.env.SPEECH_SERVICE_ENDPOINT || 'https://westeurope.api.cognitive.microsoft.com/sts/v1.0/issueToken'
  },
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [],
  /*
  ** Plugins to load before mounting the App
  // */
  plugins: [
    //   '~/plugins/responsiveVoice'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: [ '~/assets/variables.scss' ],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend( config, ctx ) {
    }
  }
};
