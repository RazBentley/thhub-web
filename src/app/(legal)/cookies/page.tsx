import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | TH Hub",
  description: "TH Hub cookie policy — what cookies we use and why.",
};

export default function CookiePolicyPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="mt-2 text-text-secondary">Last updated: April 2026</p>
      </div>

      <Section title="1. What Are Cookies?">
        <p>
          Cookies are small text files that are placed on your device when you
          visit a website. They are widely used to make websites work
          efficiently and to provide information to website owners.
        </p>
      </Section>

      <Section title="2. How We Use Cookies">
        <p>TH Hub uses cookies for the following purposes:</p>

        <h4 className="mt-3 font-semibold text-text">
          Essential Cookies (Strictly Necessary)
        </h4>
        <p>
          These cookies are necessary for the Platform to function and cannot be
          switched off. They include:
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 font-semibold text-text">Cookie</th>
                <th className="pb-2 pr-4 font-semibold text-text">Purpose</th>
                <th className="pb-2 font-semibold text-text">Duration</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Firebase Auth</td>
                <td className="py-2 pr-4">
                  Keeps you signed in to your account and manages your
                  authentication session
                </td>
                <td className="py-2">Session / Persistent</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">th_cookie_consent</td>
                <td className="py-2 pr-4">
                  Remembers your cookie consent preference
                </td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="mt-4 font-semibold text-text">
          Functional Cookies
        </h4>
        <p>
          These cookies enable enhanced functionality and personalisation:
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 font-semibold text-text">Cookie</th>
                <th className="pb-2 pr-4 font-semibold text-text">Purpose</th>
                <th className="pb-2 font-semibold text-text">Duration</th>
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4">Theme preference</td>
                <td className="py-2 pr-4">
                  Remembers your dark/light mode selection
                </td>
                <td className="py-2">Persistent (localStorage)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Third-Party Cookies">
        <p>
          Our Platform uses Google Firebase, which may set its own cookies for
          authentication and service functionality. These cookies are governed
          by Google&apos;s privacy policy. We do not use any advertising or
          tracking cookies from third parties.
        </p>
      </Section>

      <Section title="4. Managing Cookies">
        <p>
          You can control and manage cookies in several ways:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Browser settings:</strong> Most web browsers allow you to
            manage cookies through their settings. You can typically find these
            in the &quot;Options&quot;, &quot;Settings&quot;, or
            &quot;Preferences&quot; menu of your browser.
          </li>
          <li>
            <strong>Our cookie banner:</strong> When you first visit our
            website, you can accept or manage your cookie preferences via our
            cookie consent banner.
          </li>
        </ul>
        <p>
          Please note that blocking essential cookies may prevent you from using
          certain features of the Platform, including signing in to your
          account.
        </p>
      </Section>

      <Section title="5. More Information">
        <p>
          For more information about cookies and how to manage them, visit{" "}
          <span className="text-primary">www.allaboutcookies.org</span>.
        </p>
        <p>
          For details on how we handle your personal data, please see our{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          If you have any questions about our use of cookies, please contact us
          through thhub.co.uk.
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
