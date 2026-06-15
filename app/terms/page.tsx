import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Verytis",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Terms of Service</h1>
          <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-lg font-semibold text-neutral-950">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing or using Verytis ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">2. Description of Service</h2>
              <p className="mt-2">
                Verytis provides a software-as-a-service platform for managing manual campaigns, target summaries, and follow-ups. We reserve the right to modify or discontinue the Service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">3. User Responsibilities</h2>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the Service for any illegal or unauthorized purpose, including but not limited to spamming, harassing others, or transmitting malicious code.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">4. Intellectual Property</h2>
              <p className="mt-2">
                All content, features, and functionality of the Service are owned by Verytis and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">5. Limitation of Liability</h2>
              <p className="mt-2">
                In no event shall Verytis, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">6. Disclaimer of Warranties</h2>
              <p className="mt-2">
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">7. Governing Law</h2>
              <p className="mt-2">
                These Terms shall be governed and construed in accordance with the laws of France (Lyon jurisdiction), without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">8. Contact Us</h2>
              <p className="mt-2">
                If you have any questions about these Terms, please contact us at contact@verytis.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
