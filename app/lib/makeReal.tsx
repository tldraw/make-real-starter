import { Editor, createShapeId, getSvgAsImage, track } from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { blobToBase64 } from './blobToBase64'
import { getTikzFromOpenAI } from './getTikzFromOpenAI'
import { getTextFromSelectedShapes } from './getSelectionAsText'

export async function makeReal(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()
	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()!
	const newShapeId = createShapeId()
	editor.createShape<PreviewShape>({
		id: newShapeId,
		type: 'response',
		x: maxX + 60, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { html: '' },
	})

	// Get a screenshot of the selected shapes
	const maxSize = 1000
	const bounds = editor.getSelectionPageBounds()
	if (!bounds) throw Error('Could not get bounds of selection.')
	const scale = Math.min(1, maxSize / bounds.width, maxSize / bounds.height)
	const { blob } = await editor.toImage(selectedShapes, {
		scale: scale,
		background: true,
		format: 'jpeg',
	})
	const dataUrl = await blobToBase64(blob!)

	// Get any previous previews among the selected shapes
	const previousPreviews = selectedShapes.filter(
		(shape) => shape.type === 'response'
	) as PreviewShape[]

	// Send everything to OpenAI and get some HTML back
	try {
		const json = await getTikzFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getTextFromSelectedShapes(editor),
			previousPreviews,
			theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (!json) throw Error('Could not contact OpenAI.')
		if (json?.error) throw Error(`${json.error.message?.slice(0, 128)}...`)

		// Extract the TikZ code from the response
		const message = json.choices[0].message.content
		console.log('OpenAI Response:', message)

		// Try to extract TikZ code from markdown code blocks first
		let tikzCode = ''
		const codeBlockMatch = message.match(/```(?:tikz)?\n([\s\S]*?)```/)
		if (codeBlockMatch) {
			tikzCode = codeBlockMatch[1].trim()
		} else {
			// If no code block, look for tikzpicture directly
			const tikzMatch = message.match(/(\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\})/)
			if (tikzMatch) {
				tikzCode = tikzMatch[1].trim()
			} else {
				// Fall back to using the entire message
				tikzCode = message.trim()
			}
		}

		// No TikZ code? Something went wrong
		if (tikzCode.length < 10) {
			console.warn(message)
			throw Error('Could not generate a diagram from those wireframes.')
		}

		// Wrap the TikZ code in an HTML template with TikZJax
		const html = `<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Generated Graph</title>
	<link rel="stylesheet" type="text/css" href="https://tikzjax.com/v1/fonts.css">
	<script src="https://tikzjax.com/v1/tikzjax.js"></script>
	<style>
		body {
			margin: 0;
			padding: 20px;
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 100vh;
			background: white;
		}
	</style>
</head>
<body>
	<script type="text/tikz">
${tikzCode}
	</script>
</body>
</html>`

		// Update the shape with the new props
		editor.updateShape<PreviewShape>({
			id: newShapeId,
			type: 'response',
			props: {
				html,
			},
		})

		console.log(`Response: ${message}`)
	} catch (e) {
		// If anything went wrong, delete the shape.
		editor.deleteShape(newShapeId)
		throw e
	}
}
