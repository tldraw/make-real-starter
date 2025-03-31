# Make Real

Use this repo as a template to create Make Real style apps like
[makereal.tldraw.com](https://makereal.tldraw.com). To get started:

1. Use the template and clone your new repo to your computer
2. Run `npm install` to install dependencies
3. Get an OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
4. Create a `.env.local` file that contains `NEXT_PUBLIC_OPENAI_API_KEY=your api key here`
5. Run `npm run dev`
6. Open [localhost:3000](http://localhost:3000) and make some stuff real!

## How it works

Make Real is built with the [tldraw
SDK](https://tldraw.dev/?utm_source=github&utm_medium=readme&utm_campaign=make-real), a very good
React library for creating whiteboards and other infinite canvas experiences.

To use it, first draw a mockup for a piece of UI. When you're ready, select the drawing, and press
the Make Real button. We'll capture an image of your selection, and send it to
[GPT](https://platform.openai.com/docs/guides/vision) along with instructions to turn it into a HTML
file.

We take the HTML response and add it to a tldraw [custom
shape](https://tldraw.dev/docs/shapes#Custom-shapes). The custom shape shows the response in an
iframe so that you can interact with it on the canvas. If you want to iterate on the response,
annotate the iframe, select it all, and press 'Make Real' again.

## To make changes

To change how Make Real works, start from the [`prompt.ts`](./app/prompt.ts) file. From there, you
can change the prompt that gets sent to gpt-4.

You can edit the `makeReal` function in [`makeReal.ts`](./app/lib/makeReal.tsx) to change what
happens when you hit the Make Real button.

If you'd like Make Real to create something other than HTML, you'll need to either update the
[`PreviewShape`](./app/PreviewShape/PreviewShape.tsx) to display something different, or use one of
tldraw's built-in shapes like image or text.

## The dangerous API key input method

For prototyping, we've also included the `RiskyButCoolAPIKeyInput`, similar to the one found on
[makereal.tldraw.com](https://makereal.tldraw.com). Please use this as carefully and ethically as
you can, as users should be reluctant to add API keys to public sites.
