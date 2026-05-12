import { notFound } from "next/navigation";
import { Layout } from "@/components/screens/posts";
import { getPosts } from "@/lib/mdx";
import { OpenGraph } from "@/lib/og";

const route = "projects";

const Posts = getPosts(route);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Posts.map((post) => ({
    slug: `${post.slug}`,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = Posts.find((post: { slug: string }) => post.slug === slug);
  const title = post ? post.title : "";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const image = `${siteUrl}/api/og?title=${encodeURIComponent(title)}`;

  return {
    ...OpenGraph,
    title,
    openGraph: {
      title,
      images: [image],
    },
    twitter: {
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = Posts.find((post: { slug: string }) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return <Layout post={post} route={route} />;
}
