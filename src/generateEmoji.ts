import { Ollama } from 'ollama';
import { loadData, writeData } from '.';

export function findEmoji(str) {
	if (!str) return null;

	const emojiRegex = /(?:\p{Extended_Pictographic}|[\uD83C\uDDE6-\uD83C\uDDFF]{2})+/gu;

	const matches = str.trim().match(emojiRegex);

	return matches?.[0];
}

const ollama = new Ollama();

async function generateEmoji(prompt): Promise<string | undefined> {
	console.log(`Generating an emoji from prompt "${prompt}"`);

	const response = await ollama.chat({
		model: "llama3.2",
		messages: [
			{
				role: 'system',
				content: `
				When prompted, determine a unicode emoji relevant to the context provided. Ensure your response only contains a single emoji, with no additional dialogue. Avoid yellow face, human, or expression emojis
			`,
			},
			{
				role: 'user',
				content: prompt,
			},
		]
	});
	
	const messageContent = response.message.content;

	console.log(`Model responded with ${messageContent}`);
	
	const validEmoji = await findEmoji(messageContent);

	if (!validEmoji) {
		console.log(`Response ${messageContent} is not a valid emoji.`);
		return await generateEmoji(prompt);
	}

	return validEmoji;
}

export async function generateEmojiForChannel(channel): Promise<string | undefined> {
	if (!('id' in channel && 'name' in channel)) return;

	const response = await generateEmoji(
		`${channel.name}${channel?.topic ? ` - ${channel.topic}` : ''}`
	);

	const data = await loadData();

	writeData({
		...data,
		emojis: {
			...data.emojis,
			[channel.id]: response,
		},
	});
	
	return response;
}
