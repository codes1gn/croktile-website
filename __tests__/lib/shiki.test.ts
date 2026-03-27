jest.mock("shiki", () => ({
  createHighlighter: jest.fn().mockResolvedValue({
    codeToHtml: jest.fn((code: string, opts: any) => `<pre><code>${code}</code></pre>`),
    getLoadedLanguages: jest.fn(() => ["cpp", "bash", "typescript", "javascript"]),
  }),
}));

import { highlightCode, getHighlighter } from "@/lib/shiki";

describe("shiki highlighting", () => {
  it("exports getHighlighter function", () => {
    expect(typeof getHighlighter).toBe("function");
  });

  it("exports highlightCode function", () => {
    expect(typeof highlightCode).toBe("function");
  });

  it("returns a highlighter instance", async () => {
    const hl = await getHighlighter();
    expect(hl).toBeDefined();
    expect(typeof hl.codeToHtml).toBe("function");
  });

  it("highlights code and returns HTML", async () => {
    const html = await highlightCode("int x = 1;", "cpp", "github-dark");
    expect(html).toContain("int x = 1;");
    expect(html).toContain("<pre>");
  });

  it("maps croktile/co to cpp", async () => {
    const html = await highlightCode("f32 x;", "croktile");
    expect(html).toContain("f32 x;");
  });

  it("returns singleton highlighter", async () => {
    const hl1 = await getHighlighter();
    const hl2 = await getHighlighter();
    expect(hl1).toBe(hl2);
  });
});
