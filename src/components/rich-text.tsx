import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RichText({ content }: { content: string }) {
  return (
    <div className="prose-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-brand-600 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="my-5 w-full rounded-xl" loading="lazy" />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
