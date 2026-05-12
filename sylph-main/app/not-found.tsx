import { Footer } from "@/components/footer";
import Link from "@/components/link";
import * as FadeIn from "@/components/motion/staggers/fade";

export default function NotFound() {
  return (
    <FadeIn.Container>
      <FadeIn.Item>
        <header className="flex flex-col gap-1">
          <h1 className="font-serif">404</h1>
          <p className="!mt-2 text-muted">This page does not exist.</p>
        </header>
      </FadeIn.Item>

      <FadeIn.Item>
        <p className="!mt-8">
          <Link href="/" underline>
            Return home
          </Link>
        </p>
      </FadeIn.Item>

      <div className="!mt-16">
        <FadeIn.Item>
          <Footer />
        </FadeIn.Item>
      </div>
    </FadeIn.Container>
  );
}
