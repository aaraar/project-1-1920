require('dotenv').config();
const express = require ( 'express' );
const consola = require ( 'consola' );
const { Nuxt, Builder } = require ( 'nuxt' );
const app = express();
const xmlbuilder = require('xmlbuilder');
const rp = require('request-promise');
const fs = require('fs');
const readline = require('readline-sync');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

// Import and Set Nuxt.js options
const config = require ( '../nuxt.config.js' );
config.dev = process.env.NODE_ENV !== 'production';

async function start() {

  app.get('/tts/:query', main);

  // Init Nuxt.js
  const nuxt = new Nuxt ( config );

  const { host, port } = nuxt.options.server;
  if ( config.dev ) {
    const builder = new Builder ( nuxt );
    await builder.build ()
  } else {
    await nuxt.ready ()
  }

  // Give nuxt middleware to express
  app.use ( nuxt.render );

  // Listen the server
  app.listen ( port, host );
  consola.ready ( {
    message: `Server listening on http://${ host }:${ port }`,
    badge: true
  } )
}

start ();

// Gets an access token.
function getAccessToken(subscriptionKey) {
  let options = {
    method: 'POST',
    uri: 'https://westeurope.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    }
  };
  return rp(options);
}

// Converts text to speech using the input from readline.
function textToSpeech(accessToken, req, res) {
  // Create the SSML request.
  let xml_body = xmlbuilder.create('speak')
    .att('version', '1.0')
    .att('xml:lang', 'nl-nl')
    .ele('voice')
    .att('xml:lang', 'nl-nl')
    .att('name', 'Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)') // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
    .txt(decodeURIComponent(req.params.query))
    .end();
  // Convert the XML into a string to send in the TTS request.
  let body = xml_body.toString();

  let options = {
    method: 'POST',
    baseUrl: 'https://westeurope.tts.speech.microsoft.com/',
    url: 'cognitiveservices/v1',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'cache-control': 'no-cache',
      'User-Agent': process.env.SPEECH_SERVICE_RESOURCE_NAME,
      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
      'Content-Type': 'application/ssml+xml'
    },
    body: body
  };

  let request = rp(options)
    .on('response', (response) => {
      if (response.statusCode === 200) {
        res.set('content-type', 'audio/wav');
        res.set('accept-ranges', 'bytes');
        request.pipe(res);
      }
    });
  return request;

}

// Use async and await to get the token before attempting
// to convert text to speech.
async function main(req, res) {
  // Reads subscription key from env variable.
  // You can replace this with a string containing your subscription key. If
  // you prefer not to read from an env variable.
  // e.g. const subscriptionKey = "your_key_here";
  const subscriptionKey = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
  if (!subscriptionKey) {
    throw new Error('Environment variable for your subscription key is not set.')
  }

  try {
    const accessToken = await getAccessToken(subscriptionKey);
    await textToSpeech(accessToken, req, res);
  } catch (err) {
    console.log(`Something went wrong: ${err}`);
  }
}

// Run the application
// main();
