import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | TH Hub",
  description: "TH Hub terms and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Terms & Conditions
        </h1>
        <p className="mt-2 text-text-secondary">Last updated: April 2026</p>
      </div>

      <Section title="1. Introduction">
        <p>
          These terms and conditions (&quot;Terms&quot;) govern your use of the
          TH Hub website at thhub.co.uk and the TH Hub mobile application
          (together, the &quot;Platform&quot;), operated by TH Hub
          (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        </p>
        <p>
          By creating an account or using our Platform, you agree to be bound by
          these Terms. If you do not agree, please do not use the Platform.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          TH Hub is a personal training and nutrition coaching platform. We
          provide:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Personalised meal plans created by your assigned coach</li>
          <li>Custom workout programmes</li>
          <li>Nutrition and activity tracking tools</li>
          <li>Weekly check-in functionality</li>
          <li>Progress photo storage</li>
          <li>Direct messaging between clients and coaches</li>
          <li>Goal setting and tracking</li>
        </ul>
      </Section>

      <Section title="3. Account Registration">
        <p>To use our Platform, you must:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Be at least 18 years of age</li>
          <li>Provide accurate and complete information when registering</li>
          <li>Keep your login credentials secure and confidential</li>
          <li>Notify us immediately of any unauthorised use of your account</li>
        </ul>
        <p>
          You are responsible for all activity that occurs under your account.
          We are not liable for any loss or damage arising from unauthorised
          access to your account.
        </p>
      </Section>

      <Section title="4. Health Disclaimer">
        <p>
          <strong>
            The information and services provided through TH Hub are for general
            fitness and nutrition guidance only. They do not constitute medical
            advice.
          </strong>
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            You should consult your GP or a qualified healthcare professional
            before starting any new exercise programme, diet plan, or if you
            have any concerns about your health.
          </li>
          <li>
            Our coaches are not medical professionals unless specifically stated.
            Coaching advice should not be used as a substitute for professional
            medical advice, diagnosis, or treatment.
          </li>
          <li>
            You participate in all exercise and dietary programmes at your own
            risk. You are solely responsible for determining whether any exercise
            or nutrition plan is suitable for you.
          </li>
          <li>
            If you experience any pain, discomfort, or adverse effects during
            exercise or while following a nutrition plan, stop immediately and
            seek medical attention.
          </li>
        </ul>
      </Section>

      <Section title="5. Payments">
        <p>
          Payment for coaching services is handled offline via bank transfer or
          cash, as agreed between you and your coach. Payment terms, amounts,
          and schedules are agreed separately outside of the Platform.
        </p>
        <p>
          Access to the Platform and its features may be subject to an active
          coaching arrangement with TH Hub.
        </p>
      </Section>

      <Section title="6. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Use the Platform for any unlawful purpose or in violation of any
            applicable laws
          </li>
          <li>
            Upload any content that is offensive, harmful, defamatory, or
            infringes on the rights of others
          </li>
          <li>
            Attempt to gain unauthorised access to other users&apos; accounts or
            data
          </li>
          <li>
            Use the Platform to harass, abuse, or harm other users
          </li>
          <li>
            Interfere with or disrupt the Platform or its infrastructure
          </li>
          <li>
            Share your account credentials with any other person
          </li>
          <li>
            Scrape, copy, or extract data from the Platform through automated
            means
          </li>
        </ul>
      </Section>

      <Section title="7. User Content">
        <p>
          You retain ownership of any content you upload to the Platform,
          including progress photos, messages, and check-in data. By uploading
          content, you grant TH Hub a limited licence to store and display that
          content as necessary to provide the service.
        </p>
        <p>
          You are responsible for ensuring that any content you upload does not
          infringe on the intellectual property rights or privacy of any third
          party.
        </p>
      </Section>

      <Section title="8. Intellectual Property">
        <p>
          All intellectual property rights in the Platform, including its
          design, branding, code, and original content, belong to TH Hub. You
          may not copy, modify, distribute, or create derivative works from any
          part of the Platform without our prior written consent.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the fullest extent permitted by law:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            The Platform is provided &quot;as is&quot; and &quot;as
            available&quot; without warranties of any kind, express or implied.
          </li>
          <li>
            We do not guarantee that the Platform will be uninterrupted,
            error-free, or free from viruses or other harmful components.
          </li>
          <li>
            We shall not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of the Platform.
          </li>
          <li>
            We are not liable for any injury, illness, or adverse health effects
            resulting from following any exercise or nutrition guidance provided
            through the Platform.
          </li>
        </ul>
        <p>
          Nothing in these Terms excludes or limits our liability for death or
          personal injury caused by our negligence, fraud, or any other
          liability that cannot be excluded by law.
        </p>
      </Section>

      <Section title="10. Account Termination">
        <p>
          You may delete your account at any time by contacting us through
          thhub.co.uk. Upon deletion, your personal data will be removed in
          accordance with our{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          We reserve the right to suspend or terminate your account if you
          breach these Terms, with or without notice.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Changes will be posted on
          this page with an updated date. Your continued use of the Platform
          after any changes constitutes acceptance of the new Terms.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws
          of England and Wales. Any disputes arising from these Terms shall be
          subject to the exclusive jurisdiction of the courts of England and
          Wales.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          If you have any questions about these Terms, please contact us through
          thhub.co.uk.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-text">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
        {children}
      </div>
    </section>
  );
}
