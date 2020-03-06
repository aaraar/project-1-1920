<template>
  <v-app baseline>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
      color="red"
      dark
    >
      <v-toolbar-title><strong>OBA</strong> Metis</v-toolbar-title>
    </v-app-bar>
      <v-content>
        <nuxt />
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  }
}
</script>
