export default function JsonLd({ data }: { data: unknown }) {
  // </script> 注入防护：把 < 转义掉，JSON 里不会再有能提前闭合标签的序列
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
