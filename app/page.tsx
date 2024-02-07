'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import { MakeRealButton } from './components/MakeRealButton'
import { TldrawLogo } from './components/TldrawLogo'
import { RiskyButCoolAPIKeyInput } from './components/RiskyButCoolAPIKeyInput'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function App() {
	return (
		<div className="editor">
			<Tldraw persistenceKey="make-real" shareZone={<MakeRealButton />} shapeUtils={shapeUtils}>
				<TldrawLogo />
				<RiskyButCoolAPIKeyInput />
			</Tldraw>
		</div>
	)
}
