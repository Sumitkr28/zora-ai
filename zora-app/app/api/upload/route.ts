// POST /api/upload — uploads a file to Gemini Files API and returns its URI for later use
// in chat messages. Plan §3.2: PDF / audio / video go through Files API (free, 48h retention).
// Images <= 5MB can be sent inline (base64) without using this endpoint — handled client-side.

import { GoogleAIFileManager } from '@google/generative-ai/server';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

const MAX_BYTES: Record<string, number> = {
  pdf: 20 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  image: 10 * 1024 * 1024,
};

// Office binary formats Gemini's Files API can't parse. We reject these with a "save as PDF"
// hint rather than letting them fail cryptically.
const OFFICE_MIMES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function categoryOf(mime: string): keyof typeof MAX_BYTES | 'other' {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  // Gemini reads plain-text documents natively. Label them 'pdf' (document) for the client chip;
  // the upload still sends the file's real MIME type, so Gemini parses it correctly.
  if (mime.startsWith('text/') || mime === 'application/json') return 'pdf';
  return 'other';
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return new Response('GEMINI_API_KEY missing', { status: 500 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response('multipart/form-data required', { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) return new Response('file field required', { status: 400 });

  const mimeType = file.type || 'application/octet-stream';
  const category = categoryOf(mimeType);
  if (category === 'other') {
    const isOffice = OFFICE_MIMES.has(mimeType) || /\.(docx?|xlsx?|pptx?)$/i.test(file.name);
    if (isOffice) {
      return new Response(
        "Word, Excel & PowerPoint files aren't supported yet — please save it as a PDF and upload that.",
        { status: 415 },
      );
    }
    return new Response(`Unsupported file type: ${mimeType}`, { status: 400 });
  }

  const limit = MAX_BYTES[category];
  if (file.size > limit) {
    const mb = Math.round(limit / 1024 / 1024);
    return new Response(`File too large. ${category} limit: ${mb} MB`, { status: 413 });
  }

  // Buffer the upload to a temp file because the Files API SDK takes a file path.
  const buf = Buffer.from(await file.arrayBuffer());
  const tmpPath = path.join(tmpdir(), `zora-upload-${Date.now()}-${file.name}`);
  await fs.writeFile(tmpPath, buf);

  try {
    const fm = new GoogleAIFileManager(apiKey);
    const result = await fm.uploadFile(tmpPath, {
      mimeType,
      displayName: file.name,
    });
    return Response.json({
      fileUri: result.file.uri,
      mimeType,
      name: file.name,
      size: file.size,
      category,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Files API upload failed';
    console.error('Files API upload failed:', err);
    return new Response(msg, { status: 502 });
  } finally {
    fs.unlink(tmpPath).catch(() => {
      /* ignore */
    });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
