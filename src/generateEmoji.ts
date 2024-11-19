import { loadData, writeData } from '.';

export function findEmoji(str) {
	if (!str) return null;

	const emojiRegex = /\p{Extended_Pictographic}/u;

	const matches = str.match(emojiRegex);

	return matches?.[0];
}

async function generateEmoji(prompt): Promise<string | undefined> {
	const response = await fetch('https://ollama.raye.tech/api/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'llama3.2',
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
			],
			stream: false,
		}),
	});

	if (!response.ok) {
		return await response.text();
	}

	const messageContent = (await response.json()).message.content;

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
		`${channel.name} ${channel?.topic ? `- ${channel.topic}` : ''}`
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
