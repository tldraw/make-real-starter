'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { MakeRealButton } from './components/MakeRealButton'
import { RiskyButCoolAPIKeyInput } from './components/RiskyButCoolAPIKeyInput'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]
const components = {
	SharePanel: () => <MakeRealButton />,
}
export default function App() {
	return (
		<div className="editor">
			<Tldraw persistenceKey="make-real" components={components} shapeUtils={shapeUtils}>
				<RiskyButCoolAPIKeyInput />
			</Tldraw>
		</div>
	)
}
