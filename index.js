const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
// const OAuthClient = require('intuit-oauth');
const config = require('./config');

const app = express();

app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(morgan('dev'));

app.use(session({ secret: 'secret', resave: 'false', saveUninitialized: 'false' }));

app.get('/', (req, res) => {
	res.status(200).send('Server works!!');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, function () {
	console.log(`Server listening on port ${PORT}!!`);
});
