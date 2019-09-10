require('dotenv').config();

const fs = require('fs');
const {promisify} = require('util');
const path = require('path');

const express = require('express');
const multer = require('multer');
const next = require('next');
const Flickr = require('flickr-sdk');

const upload = multer();
const writeFile = promisify(fs.writeFile);

const port = parseInt(process.env.PORT, 10) || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const base64Regex = new RegExp(/^data:image\/png;base64,/);

const UPLOADS_DIR = path.resolve(__dirname, process.env.UPLOADS_DIR || './uploads');

const parse = require('url').parse;

const oauth = new Flickr.OAuth(
  process.env.FLICKR_KEY,
  process.env.FLICKR_SECRET
);

let auth = oauth.plugin(
  process.env.FLICKR_ACCESS_TOKEN,
  process.env.FLICKR_ACCESS_TOKEN_SECRET
);

const db = {
	users: new Map(),
	oauth: new Map()
};

async function getRequestToken(req, res) {
  try {
	  const {body} = await oauth.request('http://localhost:3001/oauth/callback');
		const requestToken = body.oauth_token;
		const requestTokenSecret = body.oauth_token_secret;

		// store the request token and secret in the database
		db.oauth.set(requestToken, requestTokenSecret);

		// redirect the user to flickr and ask them to authorize your app.
		// perms default to "read", but you may specify "write" or "delete".
		res.setHeader('location', oauth.authorizeUrl(requestToken, 'write'));
		res.status(302).send();
	} catch (err) {
		res.status(400).send(err.message);
	}
}

async function verifyRequestToken(req, res) {
  const url = parse(req.url, true);
  const query = url.query;

	const requestToken = query.oauth_token;
	const oauthVerifier = query.oauth_verifier;

	// retrieve the request secret from the database
	const requestTokenSecret = db.oauth.get(requestToken);

  try {
    const _res = await oauth.verify(requestToken, oauthVerifier, requestTokenSecret);

    const userNsid = _res.body.user_nsid;
    const oauthToken = _res.body.oauth_token;
    const oauthTokenSecret = _res.body.oauth_token_secret;

    // store the oauth token and secret in the database
    db.users.set(userNsid, {
      oauthToken: oauthToken,
      oauthTokenSecret: oauthTokenSecret
    });

    // we no longer need the request token and secret so we can delete them
    db.oauth.delete(requestToken);

    // log our oauth token and secret for debugging
    console.log('oauth token:', oauthToken);
    console.log('oauth token secret:', oauthTokenSecret);
    
    auth = oauth.plugin(
      oauthToken,
      oauthTokenSecret
    );
    
    // create a new Flickr API client using the oauth plugin
    const flickr = new Flickr();

    // make an API call on behalf of the user
    await flickr.test.login();
    
    res.setHeader('location', 'http://localhost:3001');
    res.status(302).send();
	} catch (err) {
		res.statusCode = 400;
		res.end(err.message);
	}
}

(async () => {
  await app.prepare();

  const server = express();

  server.post('/upload', upload.single('image'), async (req, res) => {

    const file = req.file;

    try {
      const base64Data = file.buffer.toString().replace(base64Regex, '');

      const date = new Date();
      const title = date.toISOString();
      const fileName = `${title}.png`;
      const filePath = `${UPLOADS_DIR}/${fileName}`;

      await writeFile(filePath, base64Data, 'base64');

      const result = await Flickr.Upload(auth, filePath, {
        title
      });

      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  });

  server.get('/login', getRequestToken);
  server.get('/oauth/callback', verifyRequestToken)

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
