require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const next = require('next');
const {promisify} = require('util');
const Flickr = require('flickrapi');

const upload = multer();
const writeFile = promisify(fs.writeFile);

const port = parseInt(process.env.PORT, 10) || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const base64Regex = new RegExp(/^data:image\/png;base64,/);

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
const flickrOptions = {
  api_key: process.env.FLICKR_KEY,
  secret: process.env.FLICKR_SECRET,
  user_id: process.env.FLICKR_USER_ID,
  access_token: process.env.FLICKR_ACCESS_TOKEN,
  access_token_secret: process.env.FLICKR_ACCESS_TOKEN_SECRET,
  permissions: 'write'
};

function authenticateFlickr() {
  return new Promise((resolve, reject) =>
    Flickr.authenticate(flickrOptions, (err, flickr) => {
      if (err) {
        return reject(err);
      }

      return resolve(flickr);
    })
  );
}

function uploadToFlickr(options) {
  return new Promise((resolve, reject) =>
    Flickr.upload(options, flickrOptions, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    })
  );
}

(async () => {
  await app.prepare();

  await authenticateFlickr();

  const server = express();

  server.post('/upload', upload.single('image'), async (req, res) => {

    const file = req.file;

    try {
      const base64Data = file.buffer.toString().replace(base64Regex, '');

      const date = new Date();
      const fileName = `${date.toISOString()}-${file.fieldname}.png`;

      const filePath = `${UPLOADS_DIR}/${fileName}`;

      await writeFile(filePath, base64Data, 'base64');

      const result = await uploadToFlickr({
        photos: [{
          title: date.toLocaleString(),
          photo: filePath
        }]
      });

      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) {
      throw err;
    }

    console.log(`> Ready on http://localhost:${port}`)
  });

})();
