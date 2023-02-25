export type APIWebhookTopGGBody = {
	user: string;
	type: 'test' | 'upvote';
	query: string;
	bot: string;
};
