import express from 'express';
import { getPathFromProjectRoot } from './utils/getPathFromProjectRoot';
import * as fs from 'fs';
import cors from 'cors';
import { generateEmojiForChannel } from './generateEmoji';

export const app = express();

const port = 5010;

const dataPath = getPathFromProjectRoot('/data.json');

export const loadData = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

export const writeData = (data) =>
	fs.writeFileSync(dataPath, JSON.stringify(data));

app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

app.use(express.json());

app.get('/', (req, res) => {
	res.send('guh');
});

app.post('/getemoji', async (req, res) => {
	const channelId = req.query.id as string;

	const generate = req.query?.generate;

	if (!channelId) {
		res.status(400).send('Provide a channel id');
		return;
	}

	const data = loadData();

	const emoji = data?.emojis?.[channelId];

	if (!emoji) {
		console.log(`No emoji for ${channelId}`);

		
		if (generate) {
            const channel = req.body.channel;

            if(!channel) {
                res.status(400).send("Generate flag passed, but no channel object was provided");
                return;
            }

            const generateEmoji = await generateEmojiForChannel(channel);

            if(!generateEmoji) {
                res.status(500).send("Failed to generate emoji");    
            }

            res.send(generateEmoji);
		} else {
			console.log("channel doesnt exist??")
			res.status(400).send(
				'Channel not generated and generate flag not passed'
			);
		}
	} else {
		res.send(emoji);
	}
});

app.listen(port, () => {
	console.log('we outta light bulbs');
});
