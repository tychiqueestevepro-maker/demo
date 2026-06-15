import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Verytis",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm sm:p-12">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Privacy Policy</h1>
          <p className="mt-2 text-sm text-neutral-500">Last updated: June 2026</p>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-lg font-semibold text-neutral-950">1. Information We Collect</h2>
              <p className="mt-2">
                We collect information you provide directly to us, such as when you create or modify your account, use our services, or communicate with us. This may include your name, email address, password, payment information, and data regarding the campaigns and contacts you upload to the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">2. How We Use Your Information</h2>
              <p className="mt-2">
                We use the information we collect to provide, maintain, and improve our services. This includes securely authenticating users, processing payments, offering customer support, and monitoring the usage of our platform to detect and prevent technical issues or abusive behavior.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">3. Information Sharing and Disclosure</h2>
              <p className="mt-2">
                We do not sell your personal data. We may share your information with third-party service providers (such as hosting and payment processors) who perform services on our behalf, under confidentiality agreements. We may also disclose information if required by law or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">4. Third-Party Services</h2>
              <p className="mt-2">
                Our platform integrates with third-party APIs (e.g., Stripe for payments, Supabase for authentication). These services have their own privacy policies governing the collection and processing of your data when interacting with them through Verytis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">5. Your California Privacy Rights (CCPA / CalOPPA)</h2>
              <p className="mt-2">
                If you are a California resident, you have the right to request access to the specific pieces of personal information we have collected about you, request the deletion of your personal information, and opt-out of the sale of your personal information. As stated above, we do not sell your personal information. To exercise your rights, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">6. Data Security</h2>
              <p className="mt-2">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet or email transmission is ever fully secure or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">7. Changes to This Privacy Policy</h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-950">8. Contact Us</h2>
              <p className="mt-2">
                If you have any questions or concerns about our privacy practices or this Privacy Policy, please contact us at contact@verytis.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
