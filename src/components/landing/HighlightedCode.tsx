"use client";

import { memo, useEffect, useState } from "react";

type Props = {
  code: string;
  lang?: string;
};

type TokenType = "keyword" | "type" | "storage" | "function" | "string" | "comment" | "number" | "operator" | "punctuation" | "default";

const DARK: Record<TokenType, string> = {
  keyword: "#ff7b72",
  type: "#79c0ff",
  storage: "#d2a8ff",
  function: "#d2a8ff",
  string: "#a5d6ff",
  comment: "#8b949e",
  number: "#79c0ff",
  operator: "#ff7b72",
  punctuation: "#8b949e",
  default: "#e6edf3",
};

const LIGHT: Record<TokenType, string> = {
  keyword: "#cf222e",
  type: "#0550ae",
  storage: "#8250df",
  function: "#8250df",
  string: "#0a3069",
  comment: "#6e7781",
  number: "#0550ae",
  operator: "#cf222e",
  punctuation: "#6e7781",
  default: "#1f2328",
};

const CHOREO_KEYWORDS = new Set([
  "__co__", "__cok__", "__real_cok__", "__co_device__", "__device__",
  "parallel", "by", "with", "in", "foreach", "wait", "call", "select",
  "return", "where", "while", "break", "continue", "if", "else",
  "vectorize", "after", "cdiv", "inthreads", "for", "auto", "template",
  "inline", "extern", "const", "constexpr", "typename", "sizeof",
]);

const CHOREO_TYPES = new Set([
  "void", "bool", "int", "half", "float", "double",
  "f64", "f32", "f16", "bf16", "f8", "f8_e4m3", "f8_e5m2",
  "f8_ue4m3", "f8_ue8m0", "f6_e3m2", "f4_e2m1", "tf32",
  "u64", "s64", "u32", "s32", "u16", "s16", "u8", "s8",
  "u6", "s6", "u4", "s4", "u2", "s2", "u1",
  "size_t", "char",
]);

const CHOREO_STORAGE = new Set([
  "local", "shared", "global", "stream",
  "block", "group", "group-4", "thread", "device", "term",
  "mutable",
]);

const CHOREO_BUILTINS = new Set([
  "dma", "tma", "mma", "sync", "trigger", "assert", "swap",
  "rotate", "print", "println", "frag", "stage", "event",
]);

const CHOREO_METHODS = new Set([
  "copy", "transp", "pad", "swizzle", "swiz", "sp", "zfill", "any",
  "async", "span", "span_as", "mdata", "data", "view", "from",
  "chunkat", "chunk", "subspan", "modspan", "step", "stride", "at",
  "fill", "load", "store", "row", "col", "scale", "commit",
]);

const PYTHON_KEYWORDS = new Set([
  "def", "class", "return", "if", "else", "elif", "for", "in",
  "while", "break", "continue", "import", "from", "as", "with",
  "pass", "raise", "yield", "lambda", "not", "and", "or", "is",
  "None", "True", "False", "self", "range", "print",
]);

const C_KEYWORDS = new Set([
  "void", "int", "float", "double", "char", "unsigned", "signed",
  "long", "short", "const", "static", "extern", "inline", "volatile",
  "auto", "register", "return", "if", "else", "for", "while", "do",
  "switch", "case", "break", "continue", "default", "goto",
  "struct", "union", "enum", "typedef", "sizeof",
  "__global__", "__device__", "__shared__", "__syncthreads",
  "__half2float", "template", "constexpr", "typename",
  "#pragma", "unroll",
]);

function tokenizeLine(line: string, lang: string): Array<{ text: string; type: TokenType }> {
  const tokens: Array<{ text: string; type: TokenType }> = [];
  let pos = 0;

  const isChoreo = lang === "choreo" || lang === "co";
  const isPython = lang === "python" || lang === "py";
  const keywords = isChoreo ? CHOREO_KEYWORDS : isPython ? PYTHON_KEYWORDS : C_KEYWORDS;

  while (pos < line.length) {
    if (line[pos] === "/" && line[pos + 1] === "/") {
      tokens.push({ text: line.slice(pos), type: "comment" });
      break;
    }
    if (line[pos] === "#" && isPython) {
      tokens.push({ text: line.slice(pos), type: "comment" });
      break;
    }
    if (line[pos] === "#" && !isPython && /^#(error|define|if|endif|include|pragma|elif|else)\b/.test(line.slice(pos))) {
      const match = line.slice(pos).match(/^#\w+/);
      if (match) {
        tokens.push({ text: match[0], type: "keyword" });
        pos += match[0].length;
        tokens.push({ text: line.slice(pos), type: "string" });
        break;
      }
    }

    if (line[pos] === '"') {
      let end = pos + 1;
      while (end < line.length && line[end] !== '"') {
        if (line[end] === "\\") end++;
        end++;
      }
      tokens.push({ text: line.slice(pos, end + 1), type: "string" });
      pos = end + 1;
      continue;
    }
    if (line[pos] === "'") {
      if (isPython) {
        const tripleMatch = line.slice(pos).match(/^('{3}|"{3})/);
        if (tripleMatch) {
          tokens.push({ text: line.slice(pos), type: "string" });
          break;
        }
      }
      let end = pos + 1;
      while (end < line.length && line[end] !== "'") {
        if (line[end] === "\\") end++;
        end++;
      }
      tokens.push({ text: line.slice(pos, end + 1), type: "string" });
      pos = end + 1;
      continue;
    }

    if (/\d/.test(line[pos]) || (line[pos] === "." && pos + 1 < line.length && /\d/.test(line[pos + 1]))) {
      const numMatch = line.slice(pos).match(/^(\d+\.?\d*[fFeE]?[+-]?\d*[fF]?|0[xX][0-9a-fA-F]+)/);
      if (numMatch) {
        tokens.push({ text: numMatch[0], type: "number" });
        pos += numMatch[0].length;
        continue;
      }
    }

    if (line[pos] === "@" && isPython) {
      const decoMatch = line.slice(pos).match(/^@[a-zA-Z_][a-zA-Z0-9_.]*/);
      if (decoMatch) {
        tokens.push({ text: decoMatch[0], type: "function" });
        pos += decoMatch[0].length;
        continue;
      }
    }

    if (/[a-zA-Z_]/.test(line[pos])) {
      const wordMatch = line.slice(pos).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        let type: TokenType = "default";
        if (keywords.has(word)) {
          type = "keyword";
        } else if (isChoreo && CHOREO_TYPES.has(word)) {
          type = "type";
        } else if (isChoreo && CHOREO_STORAGE.has(word)) {
          type = "storage";
        } else if (isChoreo && CHOREO_BUILTINS.has(word)) {
          type = "function";
        } else if (isPython && /^(tl|hl|torch|triton|helion|cutlass|cute)$/.test(word)) {
          type = "function";
        } else if (!isChoreo && !isPython && C_KEYWORDS.has(word)) {
          type = "keyword";
        }
        tokens.push({ text: word, type });
        pos += word.length;
        continue;
      }
    }

    if (line[pos] === "." && pos + 1 < line.length) {
      const methodMatch = line.slice(pos + 1).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if (methodMatch && isChoreo && CHOREO_METHODS.has(methodMatch[0])) {
        tokens.push({ text: ".", type: "punctuation" });
        tokens.push({ text: methodMatch[0], type: "function" });
        pos += 1 + methodMatch[0].length;
        continue;
      }
      if (methodMatch && isPython) {
        tokens.push({ text: ".", type: "punctuation" });
        const mName = methodMatch[0];
        const mType: TokenType = /^(constexpr|program_id|num_programs|load|store|zeros|arange|dot|float16|float32|float8e4nv|to|cdiv|range|jit|autotune|Config|shape|stride|dtype|T|device|empty|matmul|synchronize|assert_close|get_device_properties)$/.test(mName) ? "function" : "default";
        tokens.push({ text: mName, type: mType });
        pos += 1 + mName.length;
        continue;
      }
    }

    if (/^(=>|==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--)/.test(line.slice(pos))) {
      const opMatch = line.slice(pos).match(/^(=>|==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--)/);
      if (opMatch) {
        tokens.push({ text: opMatch[0], type: "operator" });
        pos += opMatch[0].length;
        continue;
      }
    }

    if (/^[+\-*/%=<>&|!^~?:]/.test(line[pos])) {
      tokens.push({ text: line[pos], type: "operator" });
      pos++;
      continue;
    }

    if (/^[{}()\[\];,]/.test(line[pos])) {
      tokens.push({ text: line[pos], type: "punctuation" });
      pos++;
      continue;
    }

    tokens.push({ text: line[pos], type: "default" });
    pos++;
  }

  return tokens;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export const HighlightedCode = memo(function HighlightedCode({
  code,
  lang = "choreo",
}: Props) {
  const isDark = useIsDark();
  const palette = isDark ? DARK : LIGHT;
  const lines = code.split("\n");

  return (
    <pre className="text-[13px] leading-[1.7] text-left whitespace-pre overflow-x-auto">
      <code>
        {lines.map((line, lineIdx) => (
          <div key={lineIdx}>
            {tokenizeLine(line, lang).map((token, i) => (
              <span key={i} style={{ color: palette[token.type] }}>
                {token.text}
              </span>
            ))}
            {line === "" && "\n"}
          </div>
        ))}
      </code>
    </pre>
  );
});
