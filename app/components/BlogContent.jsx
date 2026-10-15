import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

// Renders a post's text. Raw HTML is never allowed (react-markdown ignores it) and
// unsafe link schemes such as javascript: are stripped, so authors can't inject scripts.
const components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow">
      {children}
    </a>
  ),
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" />,
};

export default function BlogContent({ content }) {
  return (
    <div className="blog-content">
      <ReactMarkdown remarkPlugins={[remarkBreaks]} components={components}>
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
