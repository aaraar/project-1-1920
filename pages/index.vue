<template>
      <v-row align="start" justify="center">
      <v-card class="ma-6">
        <v-card-title class="headline">
          Live
        </v-card-title>
        <video id="video" autoplay></video>
        <v-card-actions>
          <v-btn @click="startWebcam()" class="ma-3">Start WebCam</v-btn>
          <v-btn id="takeSnap" :disabled="snapDisable" class="ma-3">Take Snapshot</v-btn>
          <v-btn @click="stopWebcam()" class="ma-3">Stop WebCam</v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="ma-6">
        <v-card-title class="headline">
          Snapshot
        </v-card-title>
        <canvas id="sourceImage"></canvas>
      </v-card>
      </v-row>
</template>

<script>
  import Logo from '~/components/Logo.vue'
  import VuetifyLogo from '~/components/VuetifyLogo.vue'

  export default {
    components: {
      Logo,
      VuetifyLogo
    },
    data: function () {
      return {
        analysis: '',
        webcamStream: null,
        params: {
          "language": "nl",
          "detectOrientation": "true",
          // "language": "en",
        },
        snapDisable: true,
        apiKey: process.env.COMPUTER_VISION_SUBSCRIPTION_KEY
      }
    },
    mounted() {
      // this.postData()
    },
    methods: {
      postData: async function ( params ) {
        const res = await this.$axios ( {
          method: 'post',
          url: 'https://northeurope.api.cognitive.microsoft.com/vision/v2.1/analyze?visualFeatures=Description&language=en',
          data: {
            params: this.params,
            url: __dirname + "/exImg.jpg"
          },
          headers: {
            "Content-Type": 'application/json',
            "Ocp-Apim-Subscription-Key": process.env.COMPUTER_VISION_SUBSCRIPTION_KEY
          }
        } );
        this.analysis = res
      },

      startWebcam: function () {
        const vid = document.querySelector ( 'video' );
        // request cam
        navigator.mediaDevices.getUserMedia ( {
          video: true
        } )
          .then ( stream => {
            this.webcamStream = stream;
            vid.srcObject = stream;
            return vid.play ();
          } )
          .then ( () => {
            var btn = document.querySelector ( '#takeSnap' );
            this.snapDisable = false;
            btn.addEventListener ( 'click', ( e ) => {
              this.takeSnap ()
                .then ( blob => {
                  this.analyseImage ( blob, this.params, this.handleData );
                } )
            } );
          } )
          .catch ( e => console.log ( 'error: ' + e ) );
      },

      takeSnap: function () {

        // get video element
        const vid = document.querySelector ( 'video' );
        // get canvas element
        const canvas = document.querySelector ( 'canvas' );
        // get its context
        const ctx = canvas.getContext ( '2d' );
        // set its size to the one of the video
        canvas.width = vid.videoWidth;
        canvas.height = vid.videoHeight;
        // show snapshot on canvas
        ctx.drawImage ( vid, 0, 0 );
        // show spinner image below
        return new Promise ( ( res, rej ) => {
          // request a Blob from the canvas
          canvas.toBlob ( res, 'image/jpeg' );
        } );
      },

      stopWebcam: function () {
        const vid = document.querySelector ( 'video' );
        vid.srcObject.getTracks ().forEach ( ( track ) => {
          track.stop ();
        } );
        // disable snapshot button
        this.snapDisable = true;
      },

      analyseImage: function ( image, params, cb ) {

        // create API url by adding params
        const paramString = Object.entries ( params ).map ( ( [ key, val ] ) => `${ key }=${ val }` ).join ( '&' );
        const urlWithParams = 'https://northeurope.api.cognitive.microsoft.com/vision/v2.0/ocr' + "?" + paramString;

        // do API call
        fetch ( urlWithParams, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": this.apiKey
          },
          processData: false,
          body: image,
        } )
          // then turn response into json
          .then ( response => response.json () )
          // then go to processingFunction
          .then ( json => cb ( json ) )
          // show alert window if something goes wrong
          .catch ( error => alert ( error.message ) );
      },
      handleData: function ( data ) {
        console.log ( data );

        const canvas = document.querySelector ( 'canvas' );
        const ctx = canvas.getContext ( '2d' );
        if (data.regions) {
          data.regions.forEach ( textRegion => {
            ctx.beginPath ();
            ctx.strokeStyle = 'green';
            ctx.strokeRect ( ...textRegion.boundingBox.split ( ',' ) );
            ctx.closePath ();
            if (textRegion.lines) {
              textRegion.lines.forEach ( line => {
                ctx.beginPath ();
                ctx.strokeStyle = 'red';
                ctx.strokeRect ( ...line.boundingBox.split ( ',' ) );
                ctx.closePath ();
              } );
            }
          } );
        }
      }
    }
  }
</script>

<style scoped>
  video {
    width: 100%;
  }
  @media (min-width: 1264px) {
    .container {
      max-width: 1400px !important;
    }
  }
</style>
