'use server'

export async function fetchFromOpenAi(
	providedApiKey: string,
	body: GPT4VCompletionRequest
): Promise<GPT4VCompletionResponse> {
	const apiKey = providedApiKey ?? process.env.OPENAI_API_KEY

	if (!apiKey) {
		throw new Error(
			'You need to provide an API key. Make sure OPENAI_API_KEY is set in your .env file.'
		)
	}

	try {
		const repsonse = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})

		return await repsonse.json()
	} catch (e) {
		console.error(e)
		throw new Error('Sorry, there was an error fetching from OpenAI')
	}
}

export type MessageContent =
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

export type GPT4VMessage = {
	role: 'system' | 'user' | 'assistant' | 'function'
	content: MessageContent
	name?: string | undefined
}

export type GPT4VCompletionRequest = {
	model: 'gpt-4-vision-preview'
	messages: GPT4VMessage[]
	functions?: unknown[] | undefined
	function_call?: unknown | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}

export type GPT4VCompletionResponse =
	| {
			error: undefined
			model: string
			choices: {
				message: { content: string }
			}[]
	  }
	| {
			error: {
				code: number
				message: string
				status: number
			}
	  }
