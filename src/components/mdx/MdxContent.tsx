import { MDXRemote } from "next-mdx-remote/rsc";

const mdxComponents = {
  h1: (props: any) => (
    <h1 className="text-3xl font-bold mt-10 mb-4 tracking-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2
      className="text-2xl font-semibold mt-8 mb-3 tracking-tight border-b pb-2"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />
  ),
  p: (props: any) => (
    <p className="my-4 leading-7 text-[var(--foreground)]" {...props} />
  ),
  ul: (props: any) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
  ol: (props: any) => (
    <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props: any) => <li className="leading-7" {...props} />,
  a: (props: any) => (
    <a
      className="text-mint-600 dark:text-mint-400 underline underline-offset-2 hover:text-mint-500 transition-colors"
      {...props}
    />
  ),
  code: (props: any) => {
    if (typeof props.children === "string" && !props.className) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-sm font-mono" {...props} />
      );
    }
    return <code {...props} />;
  },
  pre: (props: any) => (
    <pre
      className="my-6 rounded-xl border bg-[var(--card)] p-4 overflow-x-auto text-sm font-mono"
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      className="my-6 border-l-4 border-mint-500 pl-4 italic text-[var(--muted-foreground)]"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th
      className="border px-4 py-2 text-left font-semibold bg-[var(--muted)]"
      {...props}
    />
  ),
  td: (props: any) => (
    <td className="border px-4 py-2" {...props} />
  ),
  img: (props: any) => (
    <img className="my-6 rounded-xl border max-w-full" {...props} />
  ),
  hr: () => <hr className="my-8 border-t" />,
};

type Props = {
  source: string;
};

export function MdxContent({ source }: Props) {
  return (
    <div className="prose-custom max-w-none">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          parseFrontmatter: true,
          mdxOptions: { format: "md" },
        }}
      />
    </div>
  );
}
