const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
// const OAuthClient = require('intuit-oauth');
const config = require('./config');
const ngrok = config.NGROK_ENABLED === true ? require('ngrok') : null;

console.log('🚀 ~ file: index.js ~ line 8 ~ config.NGROK_ENABLED', config.NGROK_ENABLED);

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(morgan('dev'));

app.use(session({ secret: 'secret', resave: 'false', saveUninitialized: 'false' }));

app.get('/', (req, res) => {
	res.status(200).send('Server works!!');
});

/**
 * ? Start server on HTTP (will use ngrok for HTTPS forwarding)
 */
const server = app.listen(process.env.PORT || 4000, function () {
	console.log(`💻 Server listening on port ${server.address().port}`);
	if (!ngrok) {
		console.log(`💳  Step 1 : Paste this URL in your browser : ` + 'http://localhost:' + `${server.address().port}`);
		console.log('💳  Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com');
		console.log(
			`💳  Step 3 : Copy Paste this callback URL into redirectURI :` +
				'http://localhost:' +
				`${server.address().port}` +
				'/callback'
		);
		console.log(
			`💻  Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`
		);
	}
});

/**
 * ? Optional : If NGROK is enabled
 */
if (ngrok) {
	console.log('NGROK Enabled');
	ngrok
		.connect({ addr: process.env.PORT || 4000 })
		.then((url) => {
			redirectUri = `${url}/callback`;
			console.log(`💳 Step 1 : Paste this URL in your browser :  ${url}`);
			console.log('💳 Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com');
			console.log(`💳 Step 3 : Copy Paste this callback URL into redirectURI :  ${redirectUri}`);
			console.log(
				`💻 Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`
			);
		})
		.catch(() => {
			process.exit(1);
		});
}
