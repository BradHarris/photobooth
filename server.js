const express = require('express')
const next = require('next')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

const port = parseInt(process.env.PORT, 10) || 3001
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    const server = express();

    server.post('/upload', upload.single('image'), (req, res) => {
      console.log(req);
      const image = req.file;
      console.log(image);
      fs.writeSync('./uploads/test.png', image);
      res.sendStatus(204);

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
  });
