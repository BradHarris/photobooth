require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const next = require('next');
const upload = multer();

const port = parseInt(process.env.PORT, 10) || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const base64Regex = new RegExp(/^data:image\/png;base64,/);

app.prepare().then(() => {
  const server = express();

  server.post('/upload', upload.single('image'), async (req, res) => {

    const file = req.file;

    try {
      const base64Data = file.buffer.toString().replace(base64Regex, '');

      const fileName = `${(new Date()).toISOString()}-${file.fieldname}.png`;

      await fs.writeFile(`${process.env.UPLOADS_DIR}/${fileName}`, base64Data, 'base64');

      return res.sendStatus(204);
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
});
