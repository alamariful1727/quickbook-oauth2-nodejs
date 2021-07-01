const express = require('express');
const morgan = require('morgan');
const OAuthClient = require('intuit-oauth');
const request = require('request');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const config = require('./config');
const ngrok = config.NGROK_ENABLED === true ? require('ngrok') : null;

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(morgan('dev'));

app.use(cors()); // enable CORS - Cross Origin Resource Sharing

/**
 * ? Instantiate new Client
 * @type {OAuthClient}
 */

let oauthClient = null;

/**
 * ? Test Route
 */
app.get('/', (req, res) => {
	res.status(200).send('Server works!!');
});

/**
 * ? Get the AuthorizeUri
 */
app.get('/authUri', (req, res) => {
	oauthClient = new OAuthClient({
		clientId: config.clientId,
		clientSecret: config.clientSecret,
		environment: 'sandbox', // enter either `sandbox` or `production`
		redirectUri: req.query.redirectUri || config.redirectUri,
		logging: true, // by default the value is `false`
	});

	const authUri = oauthClient.authorizeUri({
		scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
		state: 'qb-oauth2-nodejs-test',
	});

	res.status(200).json({ authUri });
});

/**
 * ? Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
app.get('/callback', async (req, res) => {
	if (!oauthClient) {
		return res.status(500).json({
			message: 'Please generate /authUri first',
		});
	}
	console.log('req.query', req.query);

	try {
		const authResponse = await oauthClient.createToken(req.url);
		/**
		 * ? token information
		 * {
		 * 		x_refresh_token_expires_in: @number
		 * 		id_token: @string
		 * 		access_token: @string
		 * 		refresh_token: @string
		 * 		expires_in: @number
		 * 		token_type: @string
		 * }
		 */
		return res.status(201).json({
			message: 'success',
			token: authResponse.getJson(),
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			message: error.originalMessage || 'Something went wrong',
		});
	}
});

/**
 * ? Retrieve company information
 */
app.get('/company/:realmId', async (req, res) => {
	// Set up API call (with OAuth2 accessToken)
	const url = config.api_uri + req.params.realmId + '/companyinfo/' + req.params.realmId + '?minorversion=59';
	console.log('Making API call to: ' + url);

	const requestObj = {
		url,
		headers: {
			Authorization: 'Bearer ' + req.headers['authorization'],
			Accept: 'application/json',
		},
	};
	request(requestObj, (err, response) => {
		console.log('🚀 ~ file: index.js ~ line 107 ~ request ~ response.body', response.body);
		console.log('🚀 ~ file: index.js ~ line 107 ~ request ~ err', err);

		if (err || response.statusCode != 200) {
			return res.status(response.statusCode).json({ error: err, statusCode: response.statusCode });
		}

		// API Call was a success!
		res.json(JSON.parse(response.body));
	});
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
			let redirectUri = `${url}/callback`;
			console.log(`💳 Step 1 : Paste this URL in your browser :  ${url}`);
			console.log('💳 Step 2 : Copy and Paste the clientId and clientSecret from : https://developer.intuit.com');
			console.log(`💳 Step 3 : Copy Paste this callback URL into redirectURI : ${redirectUri}`);
			console.log(
				`💻 Step 4 : Make Sure this redirect URI is also listed under the Redirect URIs on your app in : https://developer.intuit.com`
			);
		})
		.catch(() => {
			process.exit(1);
		});
}
