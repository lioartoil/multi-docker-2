const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const {
	pgUser,
	pgHost,
	pgDatabase,
	pgPassword,
	pgPort,
	redisHost,
	redisPort
} = require('./keys');

// Express App Setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const pgClient = new Pool({
	user: pgUser,
	host: pgHost,
	database: pgDatabase,
	password: pgPassword,
	port: pgPort
});
pgClient.on('error', () => console.log('Lost PG connection'));

pgClient
	.query('CREATE TABLE IF NOT EXISTS values (number INT)')
	.catch(err => console.log(err));

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
	host: redisHost,
	port: redisPort,
	retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => res.send('Hi'));

app.get('/values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * from values');

	res.send(values.rows);
});

app.get('/values/current', (req, res) =>
	redisClient.hgetall('values', (err, values) => res.send(values))
);

app.post('/values', ({ body: { index } }, res) => {
	if (parseInt(index) > 40) return res.status(422).send('Index too high');

	redisClient.hset('values', index, 'Nothing yet!');
	redisPublisher.publish('insert', index);
	pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

	res.send({ working: true });
});

app.listen(5000, err => console.log('Listening'));
