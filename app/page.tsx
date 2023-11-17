"use client";

import dynamic from "next/dynamic";
import "@tldraw/tldraw/tldraw.css";
import { MakeRealButton } from "./components/MakeRealButton";
import { TldrawLogo } from "./components/TldrawLogo";
import { ResponseShapeUtil } from "./ResponseShape/ResponseShape";

const Tldraw = dynamic(async () => (await import("@tldraw/tldraw")).Tldraw, {
  ssr: false,
});

export default function App() {
  return (
    <div className="editor">
      <Tldraw
        persistenceKey="make-real"
        shareZone={<MakeRealButton />}
        shapeUtils={[ResponseShapeUtil]}
      >
        <TldrawLogo />
      </Tldraw>
    </div>
  );
}
