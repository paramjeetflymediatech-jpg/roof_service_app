"use client";
import React, { useMemo } from "react";
import parse, { domToReact } from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

const RenderDynamicContent = ({ content }) => {
  // 🔹 Optimized renderer (runs only when content changes)
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Try parsing JSON first
    try {
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          const Tag = item.tag || "p";
          const SubHeadingTag = item.subHeadingTag || "div";
          const key = item.id ?? index;

          return (
            <div key={key} className={index > 0 ? "mt-6" : ""}>
              {item.titleTag && (
                <Tag className="text-3xl font-bold text-gray-900 border-l-4 border-amber-500 pl-4 mb-3">
                  {item.titleTag}
                </Tag>
              )}

              {item.content && (
                <SubHeadingTag>
                  {renderHTML(item.content)}
                </SubHeadingTag>
              )}
            </div>
          );
        });
      }
    } catch (err) {
      // Not JSON → treat as HTML
    }

    // If plain HTML or text
    return <div>{renderHTML(content)}</div>;
  }, [content]);

  return renderedContent;
};

export default RenderDynamicContent;


//
// 🔹 HTML Renderer (Handles Nested HTML + Images + Tables)
//
const renderHTML = (html) => {
  const cleanHTML = DOMPurify.sanitize(html);

  const options = {
    replace: (node) => {
      if (!node.name) return;

      // ✅ Keep UL inside parent
      if (node.name === "ul") {
        return (
          <div className="">
            <ul className="list-disc  p-10 text-lg text-black font-semibold ">
              {domToReact(node.children, options)}
            </ul>
          </div>
        );
      }

      // ✅ Keep OL inside parent
      if (node.name === "ol") {
        return (
          <ol className="list-decimal  p-10 text-lg text-black font-semibold">
            {domToReact(node.children, options)}
          </ol>
        );
      }

      // ✅ Keep LI inside UL/OL
      if (node.name === "li") {
        return (
          <li className="text-gray-700">
            {domToReact(node.children, options)}
          </li>
        );
      }

      // ✅ Images
      if (node.name === "img") {
        const { src, alt } = node.attribs || {};

        return (
          <img
            src={src}
            alt={alt || "content image"}
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-lg my-4"
          />
        );
      }
      // ✅ Optional: Add styling to headings
      if (domNode.name === "h1") {
        return (
          <h1 className="text-4xl font-bold my-4">
            {domToReact(domNode.children, options)}
          </h1>
        );
      }

      if (domNode.name === "h2") {
        return (
          <h2 className="text-3xl font-semibold my-3">
            {domToReact(domNode.children, options)}
          </h2>
        );
      }

      if (domNode.name === "h3") {
        return (
          <h3 className="text-2xl font-semibold my-3">
            {domToReact(domNode.children, options)}
          </h3>
        );
      }

    },
  };

  return parse(cleanHTML, options);
};