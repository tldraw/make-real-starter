import { Editor, TLShapeId, createShapeId } from "@tldraw/tldraw";
import { ResponseShape } from "./ResponseShape/ResponseShape";
import { getSelectionAsImageDataUrl } from "./lib/getSelectionAsImageDataUrl";
import {
  GPT4VCompletionResponse,
  GPT4VMessage,
  MessageContent,
  fetchFromOpenAi,
} from "./lib/fetchFromOpenAi";

const systemPrompt = `You are an expert web developer who specializes in tailwind css.
A user will provide you with a low-fidelity wireframe of an application. 
You will return a single html file that uses HTML, tailwind css, and JavaScript to create a high fidelity website.
Include any extra CSS and JavaScript in the html file.
If you have any images, load them from Unsplash or use solid colored rectangles.
The user will provide you with notes in blue or red text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.
They may also provide you with the html of a previous design that they want you to iterate from.
Carry out any changes they request from you.
In the wireframe, the previous design's html will appear as a white rectangle.
Use creative license to make the application more fleshed out.
Use JavaScript modules and unpkg to import any necessary dependencies.

Respond ONLY with the contents of the html file.`;

export async function makeReal(editor: Editor) {
  const selectedShapes = editor.getSelectedShapes();
  if (selectedShapes.length === 0) {
    throw new Error("First select something to make real.");
  }

  const prompt = await buildPromptForOpenAi(editor);
  const responseShapeId = makeEmptyResponseShape(editor);

  try {
    const openAiResponse = await fetchFromOpenAi({
      model: "gpt-4-vision-preview",
      max_tokens: 4096,
      temperature: 0,
      messages: prompt,
    });

    populateResponseShape(editor, responseShapeId, openAiResponse);
  } catch (e) {
    editor.deleteShape(responseShapeId);
    throw e;
  }
}

async function buildPromptForOpenAi(editor: Editor): Promise<GPT4VMessage[]> {
  const previousResponseContent = getContentOfPreviousResponse(editor);
  const selectionImage = await getSelectionAsImageDataUrl(editor);

  const userMessages: MessageContent = [
    { type: "image_url", image_url: { url: selectionImage, detail: "high" } },
    { type: "text", text: "Turn this into a single html file using tailwind." },
  ];

  if (previousResponseContent) {
    userMessages.push({
      type: "text",
      text: previousResponseContent,
    });
  }

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessages },
  ];
}

function populateResponseShape(
  editor: Editor,
  responseShapeId: TLShapeId,
  openAiResponse: GPT4VCompletionResponse
) {
  if (openAiResponse.error) {
    throw new Error(openAiResponse.error.message);
  }

  const message = openAiResponse.choices[0].message.content;
  const start = message.indexOf("<!DOCTYPE html>");
  const end = message.indexOf("</html>");
  const html = message.slice(start, end + "</html>".length);

  editor.updateShape<ResponseShape>({
    id: responseShapeId,
    type: "response",
    props: { html },
  });
}

function makeEmptyResponseShape(editor: Editor) {
  const selectionBounds = editor.getSelectionPageBounds();
  if (!selectionBounds) throw new Error("No selection bounds");

  const newShapeId = createShapeId();
  editor.createShape<ResponseShape>({
    id: newShapeId,
    type: "response",
    x: selectionBounds.maxX + 60,
    y: selectionBounds.y,
  });

  return newShapeId;
}

function getContentOfPreviousResponse(editor: Editor) {
  const previousResponses = editor
    .getSelectedShapes()
    .filter((shape): shape is ResponseShape => shape.type === "response");

  if (previousResponses.length === 0) {
    return null;
  }

  if (previousResponses.length > 1) {
    throw new Error("You can only have one previous response selected");
  }

  return previousResponses[0].props.html;
}
