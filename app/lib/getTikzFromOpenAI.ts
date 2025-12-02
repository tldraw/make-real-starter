import { PreviewShape } from '../PreviewShape/PreviewShape'
import { SYSTEM_PROMPT, USER_PROMPT_WITH_PREVIOUS_DESIGN, USER_PROMPT } from '../prompt'

export async function getTikzFromOpenAI({
	image,
	apiKey,
	text,
	theme = 'light',
	previousPreviews = [],
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const messages: GPT4VCompletionRequest['messages'] = [
		{
			role: 'system',
			content: SYSTEM_PROMPT,
		},
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[1].content as Exclude<MessageContent, string>

	// Add the prompt into
	userContent.push({
		type: 'text',
		text: previousPreviews?.length > 0 ? USER_PROMPT_WITH_PREVIOUS_DESIGN : USER_PROMPT,
	})

	// Add the image
	userContent.push({
		type: 'image_url',
		image_url: {
			url: image,
			detail: 'high',
		},
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of text that we found in the design:\n${text}`,
		})
	}

	// Add the previous previews as TikZ
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous results. Here's the TikZ code you generated before: ${preview.props.html}`,
			}
		)
	}

	// Note: TikZ doesn't use themes in the same way, but we keep this for potential color adjustments
	if (theme === 'dark') {
		userContent.push({
			type: 'text',
			text: `Use lighter colors that would work well on a dark background.`,
		})
	}

	const body: GPT4VCompletionRequest = {
		model: 'gpt-5.1',
		max_completion_tokens: 4096,
		temperature: 0,
		messages,
		seed: 42,
		n: 1,
	}

	let json = null

	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})
		json = await resp.json()
	} catch (e: any) {
		throw Error(`Could not contact OpenAI: ${e.message}`)
	}

	return json
}

type MessageContent =
	| string
	| (
			| string
			| {
					type: 'image_url'
					image_url:
						| string
						| {
								url: string
								detail: 'low' | 'high' | 'auto'
						  }
			  }
			| {
					type: 'text'
					text: string
			  }
	  )[]

export type GPT4VCompletionRequest = {
	model: 'gpt-5.1'
	messages: {
		role: 'system' | 'user' | 'assistant' | 'function'
		content: MessageContent
		name?: string | undefined
	}[]
	functions?: any[] | undefined
	function_call?: any | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_completion_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	seed?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
