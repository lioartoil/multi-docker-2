const redis = require('redis');

const { redisHost, redisPort } = require('./keys');

const redisClient = redis.createClient({
	host: redisHost,
	port: redisPort,
	retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

const fib = index => {
	if (index < 2) return index;
	return fib(index - 1) + fib(index - 2);
};

sub.on('message', (channel, message) =>
	redisClient.hset('values', message, fib(parseInt(message)))
);
sub.subscribe('insert');
