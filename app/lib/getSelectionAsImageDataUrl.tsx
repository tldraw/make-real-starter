import { Editor, getSvgAsImage } from '@tldraw/tldraw'

function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, _) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
}

export async function getSelectionAsImageDataUrl(editor: Editor) {
	const svg = await editor.getSvg(editor.getSelectedShapes())
	if (!svg) throw new Error('Could not get SVG')

	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 1,
	})

	if (!blob) throw new Error('Could not get blob')
	return await blobToBase64(blob)
}
