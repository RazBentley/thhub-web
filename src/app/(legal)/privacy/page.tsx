import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TH Hub",
  description: "TH Hub privacy policy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-text-secondary">Last updated: April 2026</p>
      </div>

      <Section title="1. Who We Are">
        <p>
          TH Hub (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the
          website thhub.co.uk and the TH Hub mobile application. We provide
          personal training and nutrition coaching services.
        </p>
        <p>
          For the purposes of the UK General Data Protection Regulation (UK
          GDPR) and the Data Protection Act 2018, TH Hub is the data controller
          responsible for your personal data.
        </p>
        <p>
          If you have any questions about this privacy policy or how we handle
          your data, please contact us through thhub.co.uk.
        </p>
      </Section>

      <Section title="2. What Data We Collect">
        <p>We collect and process the following categories of personal data:</p>
        <h4 className="mt-3 font-semibold text-text">Account Information</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Full name</li>
          <li>Email address</li>
          <li>Account password (encrypted)</li>
          <li>Account role (client or coach)</li>
        </ul>

        <h4 className="mt-3 font-semibold text-text">
          Health & Fitness Data (Special Category Data)
        </h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Body weight and weight history</li>
          <li>Progress photographs (front, side, back)</li>
          <li>
            Weekly check-in data including sleep quality, energy levels, stress
            levels, appetite, recovery, and gym performance
          </li>
          <li>Weight loss/gain goals and target dates</li>
        </ul>

        <h4 className="mt-3 font-semibold text-text">
          Nutrition & Activity Data
        </h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Daily food logs (food names, calories, macronutrients)</li>
          <li>Meal plan adherence and completion data</li>
          <li>Water intake tracking</li>
          <li>Cardio activity logs (type, duration, steps)</li>
          <li>Workout completion and exercise tracking</li>
        </ul>

        <h4 className="mt-3 font-semibold text-text">Communications</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>Messages exchanged between you and your coach</li>
        </ul>

        <h4 className="mt-3 font-semibold text-text">Technical Data</h4>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Device tokens for push notifications (mobile app only, with your
            consent)
          </li>
          <li>
            Cookies and similar technologies (see our{" "}
            <a href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </a>
            )
          </li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Data">
        <p>We use your personal data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Providing our coaching service:</strong> creating and
            managing your account, delivering personalised meal plans and workout
            programmes, tracking your progress, and facilitating communication
            with your coach.
          </li>
          <li>
            <strong>Improving our service:</strong> understanding how our
            platform is used to improve features and user experience.
          </li>
          <li>
            <strong>Service communications:</strong> sending check-in reminders
            and important updates about your account.
          </li>
        </ul>
      </Section>

      <Section title="4. Legal Basis for Processing">
        <p>
          We process your personal data under the following legal bases as
          defined in the UK GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contract performance (Article 6(1)(b)):</strong> Processing
            is necessary to provide you with our coaching service, including
            managing your account, delivering meal plans and workout programmes,
            and facilitating coach-client communication.
          </li>
          <li>
            <strong>Legitimate interests (Article 6(1)(f)):</strong> We have a
            legitimate interest in improving our services and ensuring the
            security of our platform.
          </li>
          <li>
            <strong>
              Explicit consent (Article 9(2)(a) — special category data):
            </strong>{" "}
            Health-related data (weight, progress photos, wellness check-in
            information) is classified as special category data under UK GDPR.
            We process this data based on your explicit consent, which you
            provide when you voluntarily submit this information through the
            platform. You may withdraw consent at any time by contacting us or
            deleting the relevant data from your account.
          </li>
        </ul>
      </Section>

      <Section title="5. Who We Share Your Data With">
        <p>
          We do not sell, rent, or trade your personal data to any third parties.
        </p>
        <p>Your data may be shared with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Your assigned coach:</strong> Your coach can view your
            nutrition logs, workout progress, check-in data, progress photos,
            goals, and messages in order to provide you with coaching services.
          </li>
          <li>
            <strong>Firebase (Google Cloud):</strong> We use Google Firebase to
            host our application, authenticate users, store data, and store
            uploaded images. Firebase processes data in accordance with Google
            Cloud&apos;s data processing terms. Data may be transferred to and
            processed in countries outside the UK, with appropriate safeguards
            in place.
          </li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain your personal data for as long as your account is active and
          you are using our services. If you request account deletion, we will
          delete your personal data within 30 days, except where we are required
          by law to retain it for longer.
        </p>
        <p>
          Anonymised or aggregated data that cannot identify you may be retained
          indefinitely for analytical purposes.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>
          Under UK GDPR, you have the following rights regarding your personal
          data:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Right of access:</strong> You can request a copy of all
            personal data we hold about you.
          </li>
          <li>
            <strong>Right to rectification:</strong> You can request correction
            of inaccurate or incomplete data.
          </li>
          <li>
            <strong>Right to erasure:</strong> You can request deletion of your
            personal data (&quot;right to be forgotten&quot;).
          </li>
          <li>
            <strong>Right to data portability:</strong> You can request your
            data in a structured, commonly used, machine-readable format.
          </li>
          <li>
            <strong>Right to object:</strong> You can object to processing based
            on legitimate interests.
          </li>
          <li>
            <strong>Right to restrict processing:</strong> You can request that
            we limit how we use your data.
          </li>
          <li>
            <strong>Right to withdraw consent:</strong> Where processing is
            based on consent, you can withdraw it at any time without affecting
            the lawfulness of prior processing.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us through
          thhub.co.uk. We will respond to your request within one month.
        </p>
      </Section>

      <Section title="8. Payments">
        <p>
          Payments for our coaching services are handled offline via bank
          transfer or cash. We do not collect, process, or store any payment
          card details through our website or app.
        </p>
      </Section>

      <Section title="9. Data Security">
        <p>
          We take appropriate technical and organisational measures to protect
          your personal data, including:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Encryption of data in transit (HTTPS/TLS)</li>
          <li>Encrypted password storage</li>
          <li>Role-based access controls (clients can only access their own data)</li>
          <li>Secure cloud infrastructure provided by Google Firebase</li>
        </ul>
        <p>
          While we take all reasonable steps to protect your data, no method of
          electronic transmission or storage is 100% secure. We cannot guarantee
          absolute security.
        </p>
      </Section>

      <Section title="10. Children">
        <p>
          Our service is not intended for individuals under the age of 18. We do
          not knowingly collect personal data from children. If you believe we
          have collected data from a child under 18, please contact us
          immediately.
        </p>
      </Section>

      <Section title="11. Complaints">
        <p>
          If you are unhappy with how we handle your personal data, you have the
          right to lodge a complaint with the Information Commissioner&apos;s
          Office (ICO):
        </p>
        <ul className="list-none pl-0 space-y-1">
          <li>
            Website:{" "}
            <span className="text-primary">www.ico.org.uk</span>
          </li>
          <li>Telephone: 0303 123 1113</li>
        </ul>
        <p>
          We would appreciate the opportunity to address your concerns before
          you contact the ICO, so please reach out to us first.
        </p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>
          We may update this privacy policy from time to time. Any changes will
          be posted on this page with an updated &quot;last updated&quot; date.
          We encourage you to review this policy periodically.
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
