require('dotenv').config();
const express = require ( 'express' );
const consola = require ( 'consola' );
const { Nuxt, Builder } = require ( 'nuxt' );
const app = express ();
const async = require ( 'async' );
const fs = require ( 'fs' );
const path = require ( "path" );
const createReadStream = require ( 'fs' ).createReadStream;
const sleep = require ( 'util' ).promisify ( setTimeout );
const ComputerVisionClient = require ( '@azure/cognitiveservices-computervision' ).ComputerVisionClient;
const ApiKeyCredentials = require ( '@azure/ms-rest-js' ).ApiKeyCredentials;

// Import and Set Nuxt.js options
const config = require ( '../nuxt.config.js' );
config.dev = process.env.NODE_ENV !== 'production';

let key = process.env['COMPUTER_VISION_SUBSCRIPTION_KEY']
let endpoint = process.env['COMPUTER_VISION_ENDPOINT'];
if (!key) { throw new Error('Set your environment variables for your subscription key and endpoint.'); }

let computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({inHeader: {'Ocp-Apim-Subscription-Key': key}}), endpoint);

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt ( config );

  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if ( config.dev ) {
    const builder = new Builder ( nuxt );
    await builder.build ()
  } else {
    await nuxt.ready ()
  }

  // Give nuxt middleware to express
  app.use ( nuxt.render );

  function computerVision() {
    async.series([
      async function () {
        const describeImagePath = __dirname + '/exImg.jpg';
        // console.log('-------------------------------------------------');
        // console.log('DESCRIBE IMAGE');
        // console.log();
        // // Analyze local image
        // console.log('Analyzing local image to describe...', path.basename(describeImagePath));
        // // DescribeImageInStream takes a function that returns a ReadableStream, NOT just a ReadableStream instance.
        // var caption = (await computerVisionClient.describeImageInStream(
        //   () => createReadStream(describeImagePath))).captions[0];
        // console.log(`This may be ${caption.text} (${caption.confidence.toFixed(2)} confidence)`);
        /**
         * END - Describe Image
         */
        console.log();
        console.log('Recognizing printed text...', describeImagePath);
        var printed = await recognizeText(computerVisionClient, 'Printed', describeImagePath);
        printRecText(printed);
        async function recognizeText(client, mode, localImagePath) {

          // To recognize text in a local image, replace client.recognizeText() with recognizeTextInStream() as shown:
          // result = await client.recognizeTextInStream(mode, () => createReadStream(localImagePath));
          let result = await client.recognizeTextInStream(mode, () => createReadStream(localImagePath));
          // Operation ID is last path segment of operationLocation (a URL)
          let operation = result.operationLocation.split('/').slice(-1)[0];

          // Wait for text recognition to complete
          // result.status is initially undefined, since it's the result of recognizeText
          while (result.status !== 'Succeeded') { await sleep(1000); result = await client.getTextOperationResult(operation); }
          return result.recognitionResult;
        }
        // </snippet_read_helper>

        // <snippet_read_print>
        // Prints all text from OCR result
        function printRecText(ocr) {
          if (ocr.lines.length) {
            console.log('Recognized text:');
            for (let line of ocr.lines) {
              console.log(line.words.map(w => w.text).join(' '));
            }
          }
          else { console.log('No recognized text.'); }
        }
      },
      function () {
        return new Promise((resolve) => {
          resolve();
        })
      }
    ], (err) => {
      throw (err);
    });
  }
  // computerVision();


  // Listen the server
  app.listen ( port, host );
  consola.ready ( {
    message: `Server listening on http://${ host }:${ port }`,
    badge: true
  } )
}

start ();
