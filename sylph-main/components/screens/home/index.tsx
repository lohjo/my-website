import { Footer } from "@/components/footer";
import Link from "@/components/link";
import * as FadeIn from "@/components/motion/staggers/fade";
import { Posts } from "@/components/posts";
import { ProjectCard } from "@/components/project-card";
import { getPosts } from "@/lib/mdx";

const FEATURED_SLUGS = ["sentinel", "lifeline", "contextguard"];

export default function Home() {
  const projects = getPosts("projects");
  const featured = FEATURED_SLUGS.map((slug) => projects.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <FadeIn.Container>
      <FadeIn.Item>
        <header className="flex flex-col gap-1">
          <h1 className="font-serif">John Ray Loh</h1>
          <p className="!mt-2 max-w-[52ch] text-muted">
            Engineering Science student in Singapore. I build things at the intersection of deep-tech research and human-centred engineering — open-source
            medical devices, multimodal AI tooling, and a CO₂ adsorption project that I am, at this moment, fitting breakthrough curves to.
          </p>
        </header>
      </FadeIn.Item>

      <FadeIn.Item>
        <section className="!mt-12">
          <h2 className="!mt-0 font-serif">Selected work</h2>
          <div className="!mt-3 flex flex-col">
            {featured.map((post) => (
              <ProjectCard key={post.slug} href={`/projects/${post.slug}`} title={post.title} summary={post.summary ?? ""} tags={post.tags?.slice(0, 4)} />
            ))}
          </div>
        </section>
      </FadeIn.Item>

      <FadeIn.Item>
        <Posts category="research" />
      </FadeIn.Item>

      <FadeIn.Item>
        <Posts category="writing" />
      </FadeIn.Item>

      <FadeIn.Item>
        <section className="!mt-12 flex flex-col gap-1">
          <h2 className="!mt-0 font-serif">Elsewhere</h2>
          <ul className="!mt-3 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-1 !p-0">
            <li className="!m-0 list-none text-muted text-small uppercase tracking-[0.08em]">GitHub</li>
            <li className="!m-0 list-none">
              <Link href="https://github.com/lohjo" underline>
                github.com/lohjo
              </Link>
            </li>
            <li className="!m-0 list-none text-muted text-small uppercase tracking-[0.08em]">LinkedIn</li>
            <li className="!m-0 list-none">
              <Link href="https://linkedin.com/in/lohjohnray" underline>
                linkedin.com/in/lohjohnray
              </Link>
            </li>
            <li className="!m-0 list-none text-muted text-small uppercase tracking-[0.08em]">Email</li>
            <li className="!m-0 list-none">
              <a
                className="underline decoration-1 decoration-gray-a4 underline-offset-2 transition-colors hover:text-accent"
                href="mailto:hello@johnrayloh.com"
              >
                hello@johnrayloh.com
              </a>
            </li>
          </ul>
        </section>
      </FadeIn.Item>

      <div className="!mt-16">
        <FadeIn.Item>
          <Footer />
        </FadeIn.Item>
      </div>
    </FadeIn.Container>
  );
}
