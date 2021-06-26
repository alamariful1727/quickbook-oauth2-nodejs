module.exports = {
	clientId: process.env.QB_ClientId,
	clientSecret: process.env.QB_ClientSecret,
	redirectUri: process.env.QB_RedirectUri,
	configurationEndpoint: 'https://developer.api.intuit.com/.well-known/openid_sandbox_configuration/',
	api_uri: 'https://sandbox-quickbooks.api.intuit.com/v3/company/',
	scopes: {
		sign_in_with_intuit: ['openid', 'profile', 'email', 'phone', 'address'],
		connect_to_quickbooks: ['com.intuit.quickbooks.accounting', 'com.intuit.quickbooks.payment'],
		connect_handler: [
			'com.intuit.quickbooks.accounting',
			'com.intuit.quickbooks.payment',
			'openid',
			'profile',
			'email',
			'phone',
			'address',
		],
	},
	NGROK_ENABLED: process.env.NGROK_ENABLED === 'true',
};
