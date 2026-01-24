/**
 * Artifact Generator
 * Template-based document generation with locked sections
 */

import { streamText } from "ai";
import { getModel } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";
import { createHash } from "crypto";
import type {
  ArtifactTemplateDefinition,
  ArtifactSection,
  GeneratedArtifact,
  WorkflowInputs,
  TextLibraryEntry,
} from "./types";

// ============================================================================
// TEMPLATE PROCESSING
// ============================================================================

/**
 * Replace template placeholders with actual values
 * Placeholders use {{fieldKey}} syntax
 */
export function interpolateTemplate(
  template: string,
  inputs: WorkflowInputs
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    const value = getNestedValue(inputs, key);
    if (value === null || value === undefined) {
      return `[${key}]`; // Placeholder for missing values
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  });
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: WorkflowInputs, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Format a date value for display
 */
export function formatDate(value: unknown): string {
  if (!value) return "[Date not provided]";

  try {
    const date = new Date(value as string);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

// ============================================================================
// SECTION RENDERING
// ============================================================================

/**
 * Render a locked section (static content with input interpolation)
 */
function renderLockedSection(
  section: ArtifactSection,
  inputs: WorkflowInputs
): string {
  if (!section.content) {
    return "";
  }

  // Apply input mapping if provided
  let content = section.content;
  if (section.inputMapping) {
    for (const [placeholder, fieldKey] of Object.entries(section.inputMapping)) {
      const value = getNestedValue(inputs, fieldKey);
      content = content.replace(
        new RegExp(`\\{\\{${placeholder}\\}\\}`, "g"),
        value !== undefined ? String(value) : `[${placeholder}]`
      );
    }
  }

  // Interpolate any remaining placeholders
  return interpolateTemplate(content, inputs);
}

/**
 * Get content from text library entries
 */
function getTextLibraryContent(
  keys: string[],
  textLibrary: TextLibraryEntry[]
): string {
  const entries = keys
    .map((key) => textLibrary.find((t) => t.key === key))
    .filter((t): t is TextLibraryEntry => t !== undefined);

  if (entries.length === 0) {
    return "";
  }

  return entries.map((entry) => entry.content).join("\n\n");
}

/**
 * Build the AI prompt for generating section content
 */
function buildSectionPrompt(
  section: ArtifactSection,
  inputs: WorkflowInputs,
  textLibrary: TextLibraryEntry[]
): string {
  const basePrompt = section.aiPrompt || "";
  const interpolatedPrompt = interpolateTemplate(basePrompt, inputs);

  // Add text library content if specified
  let textLibraryContent = "";
  if (section.textLibraryKeys && section.textLibraryKeys.length > 0) {
    textLibraryContent = getTextLibraryContent(section.textLibraryKeys, textLibrary);
  }

  // Build context from inputs
  const inputContext = Object.entries(inputs)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");

  return `You are generating content for the "${section.title}" section of an HR document.

${interpolatedPrompt}

## Available Information:
${inputContext}

${textLibraryContent ? `## Reference Text (use as appropriate):\n${textLibraryContent}` : ""}

## Guidelines:
- Write in a professional, neutral tone
- Be concise and specific
- Do not speculate or include unverified information
- Do not include any PHI (Protected Health Information)
- Use objective language without emotional content
- Reference specific facts from the provided information

Generate the content for this section now:`;
}

// ============================================================================
// AI GENERATION
// ============================================================================

/**
 * Generate content for a single section using AI
 */
export async function generateSectionContent(
  section: ArtifactSection,
  inputs: WorkflowInputs,
  textLibrary: TextLibraryEntry[],
  model?: string
): Promise<string> {
  const prompt = buildSectionPrompt(section, inputs, textLibrary);
  const modelId = model || AI_CONFIG.defaultModels.anthropic;

  try {
    const result = await streamText({
      model: getModel(modelId),
      prompt,
    });

    // Collect the full text from the stream
    let content = "";
    for await (const chunk of result.textStream) {
      content += chunk;
    }

    return content.trim();
  } catch (error) {
    console.error(`Error generating section "${section.key}":`, error);
    throw new Error(`Failed to generate content for section: ${section.title}`);
  }
}

/**
 * Generate content for a section synchronously (non-streaming)
 */
export async function generateSectionContentSync(
  section: ArtifactSection,
  inputs: WorkflowInputs,
  textLibrary: TextLibraryEntry[],
  model?: string
): Promise<string> {
  const prompt = buildSectionPrompt(section, inputs, textLibrary);
  const modelId = model || AI_CONFIG.defaultModels.anthropic;

  try {
    const result = await streamText({
      model: getModel(modelId),
      prompt,
    });

    // Collect the full text
    let content = "";
    for await (const chunk of result.textStream) {
      content += chunk;
    }

    return content.trim();
  } catch (error) {
    console.error(`Error generating section "${section.key}":`, error);
    throw new Error(`Failed to generate content for section: ${section.title}`);
  }
}

// ============================================================================
// ARTIFACT GENERATION
// ============================================================================

/**
 * Generate a complete artifact from a template
 */
export async function generateArtifact(
  template: ArtifactTemplateDefinition,
  inputs: WorkflowInputs,
  textLibrary: TextLibraryEntry[] = [],
  options?: {
    model?: string;
    customPrompts?: Record<string, string>;
  }
): Promise<GeneratedArtifact> {
  const sections: Record<string, string> = {};

  // Process each section
  for (const section of template.sections) {
    if (section.locked) {
      // Render locked section with interpolation
      sections[section.key] = renderLockedSection(section, inputs);
    } else if (section.aiPrompt || options?.customPrompts?.[section.key]) {
      // Generate AI content
      const customSection: ArtifactSection = options?.customPrompts?.[section.key]
        ? { ...section, aiPrompt: options.customPrompts[section.key] }
        : section;

      sections[section.key] = await generateSectionContentSync(
        customSection,
        inputs,
        textLibrary,
        options?.model
      );
    } else if (section.textLibraryKeys && section.textLibraryKeys.length > 0) {
      // Use text library content
      sections[section.key] = getTextLibraryContent(
        section.textLibraryKeys,
        textLibrary
      );
    } else if (section.content) {
      // Static content
      sections[section.key] = interpolateTemplate(section.content, inputs);
    } else {
      sections[section.key] = "";
    }
  }

  // Render the complete document
  const renderedContent = renderArtifact(template, sections);

  // Generate content hash
  const contentHash = createHash("sha256")
    .update(JSON.stringify(sections))
    .digest("hex");

  return {
    templateId: template.id,
    version: 1,
    sections,
    renderedContent,
    contentHash,
    generatedAt: new Date(),
  };
}

/**
 * Render a complete artifact from sections
 */
export function renderArtifact(
  template: ArtifactTemplateDefinition,
  sections: Record<string, string>
): string {
  const parts: string[] = [];

  for (const section of template.sections) {
    const content = sections[section.key];
    if (content) {
      parts.push(`## ${section.title}\n\n${content}`);
    }
  }

  return parts.join("\n\n---\n\n");
}

/**
 * Render artifact as HTML for preview
 */
export function renderArtifactAsHtml(
  template: ArtifactTemplateDefinition,
  sections: Record<string, string>
): string {
  const htmlParts: string[] = [
    '<div class="artifact-document">',
  ];

  for (const section of template.sections) {
    const content = sections[section.key];
    if (content) {
      const lockedClass = section.locked ? "locked" : "editable";
      htmlParts.push(`
        <section class="artifact-section ${lockedClass}" data-section-key="${section.key}">
          <h2 class="section-title">${escapeHtml(section.title)}</h2>
          <div class="section-content">
            ${formatContentAsHtml(content)}
          </div>
        </section>
      `);
    }
  }

  htmlParts.push("</div>");
  return htmlParts.join("\n");
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format content as HTML (convert markdown-like syntax)
 */
function formatContentAsHtml(content: string): string {
  return content
    .split("\n\n")
    .map((para) => {
      // Handle bullet points
      if (para.startsWith("- ") || para.startsWith("* ")) {
        const items = para
          .split("\n")
          .filter((line) => line.startsWith("- ") || line.startsWith("* "))
          .map((line) => `<li>${escapeHtml(line.slice(2))}</li>`)
          .join("\n");
        return `<ul>\n${items}\n</ul>`;
      }

      // Handle numbered lists
      if (/^\d+\. /.test(para)) {
        const items = para
          .split("\n")
          .filter((line) => /^\d+\. /.test(line))
          .map((line) => `<li>${escapeHtml(line.replace(/^\d+\. /, ""))}</li>`)
          .join("\n");
        return `<ol>\n${items}\n</ol>`;
      }

      // Regular paragraph
      return `<p>${escapeHtml(para)}</p>`;
    })
    .join("\n");
}

// ============================================================================
// ARTIFACT VERSIONING
// ============================================================================

/**
 * Create a new version of an artifact with updated sections
 */
export function createArtifactVersion(
  previousArtifact: GeneratedArtifact,
  template: ArtifactTemplateDefinition,
  updatedSections: Partial<Record<string, string>>
): GeneratedArtifact {
  const sections: Record<string, string> = {
    ...previousArtifact.sections,
  };

  // Merge updated sections, filtering out undefined values
  for (const [key, value] of Object.entries(updatedSections)) {
    if (value !== undefined) {
      sections[key] = value;
    }
  }

  const renderedContent = renderArtifact(template, sections);
  const contentHash = createHash("sha256")
    .update(JSON.stringify(sections))
    .digest("hex");

  return {
    templateId: template.id,
    version: previousArtifact.version + 1,
    sections,
    renderedContent,
    contentHash,
    generatedAt: new Date(),
  };
}

/**
 * Compare two artifacts and return changed sections
 */
export function compareArtifacts(
  oldArtifact: GeneratedArtifact,
  newArtifact: GeneratedArtifact
): {
  added: string[];
  removed: string[];
  changed: string[];
  unchanged: string[];
} {
  const oldKeys = new Set(Object.keys(oldArtifact.sections));
  const newKeys = new Set(Object.keys(newArtifact.sections));

  const added = [...newKeys].filter((k) => !oldKeys.has(k));
  const removed = [...oldKeys].filter((k) => !newKeys.has(k));
  const common = [...oldKeys].filter((k) => newKeys.has(k));

  const changed = common.filter(
    (k) => oldArtifact.sections[k] !== newArtifact.sections[k]
  );
  const unchanged = common.filter(
    (k) => oldArtifact.sections[k] === newArtifact.sections[k]
  );

  return { added, removed, changed, unchanged };
}
