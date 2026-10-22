import { LegalPageLayout, type TocItem } from "../layouts/LegalPageLayout";

const TERMS_TOC: TocItem[] = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "service-description", label: "Description of Service" },
  { id: "acceptable-use", label: "Acceptable Use Policy" },
  { id: "reserved-slugs", label: "Reserved Namespaces" },
  { id: "availability", label: "Service Availability & Limits" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "termination", label: "Account Termination" },
  { id: "contact", label: "Contact Us" },
];

export function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="October 2026"
      tocItems={TERMS_TOC}
      seeAlso={{ label: "Privacy Policy", to: "/privacy" }}
    >
      {/* 1. Acceptance */}
      <section id="acceptance" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Acceptance of Terms
        </h2>
        <p className="mt-3">
          By accessing or using ShortLynk (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the Service.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 2. Service Description */}
      <section id="service-description" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Description of Service
        </h2>
        <p className="mt-3">
          ShortLynk provides URL shortening, redirection, QR code generation, and link analytics services. We reserve the right to modify, suspend, or discontinue aspects of the Service with or without prior notice.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 3. Acceptable Use */}
      <section id="acceptable-use" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Acceptable Use Policy
        </h2>
        <p className="mt-3">
          You agree not to use ShortLynk for any unlawful, deceptive, or harmful purpose. Prohibited activities include, but are not limited to:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1.5">
          <li>Distributing malware, viruses, trojans, ransomware, or other malicious payloads.</li>
          <li>Operating phishing, credential-harvesting, or deceptive authentication portals.</li>
          <li>Disseminating unsolicited bulk messaging, spam, or automated link blasting.</li>
          <li>Redirecting to content that facilitates harassment, hate speech, or illicit trade.</li>
          <li>Attempting to bypass platform rate limits, probe private endpoints, or overload infrastructure.</li>
        </ul>
        <p className="mt-3">
          Links found in violation of this policy are subject to immediate deactivation without notice.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 4. Reserved Slugs */}
      <section id="reserved-slugs" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Reserved Slugs and Custom Aliases
        </h2>
        <p className="mt-3">
          Certain short codes and URL paths are reserved for platform infrastructure, routing, API endpoints, authentication, and core application interfaces.
        </p>
        <p className="mt-2">
          System-reserved slugs include: <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">admin</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">api</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">login</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">register</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">dashboard</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">settings</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">analytics</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">pricing</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">terms</code>, and <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">privacy</code>.
        </p>
        <p className="mt-2">
          We retain the right to reclaim, reassign, or reject any custom alias that infringes on registered trademarks, impersonates official entities, or violates acceptable use standards.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 5. Availability */}
      <section id="availability" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          5. Service Availability and Rate Limits
        </h2>
        <p className="mt-3">
          ShortLynk is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. We do not provide uptime guarantees or service level agreements (SLAs).
        </p>
        <p className="mt-2">
          To maintain infrastructure health and fair resource access, API endpoints and redirection routes are subject to rate limiting. Automated requests that deliberately circumvent these boundaries may be blocked.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 6. Liability */}
      <section id="liability" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          6. Limitation of Liability and Disclaimers
        </h2>
        <p className="mt-3">
          ShortLynk functions solely as a technical routing service. We do not control, inspect, or endorse the content of third-party destination URLs created by users.
        </p>
        <p className="mt-2">
          To the maximum extent permitted by law, ShortLynk and its operators are not liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 7. Termination */}
      <section id="termination" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          7. Account Termination
        </h2>
        <p className="mt-3">
          You may terminate your account at any time via the account deletion feature in the Settings page. Upon confirmation, your account and associated data will be permanently removed.
        </p>
        <p className="mt-2">
          We reserve the right to suspend or terminate accounts that breach these Terms of Service or engage in abusive activities that compromise the integrity of the platform.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 8. Contact */}
      <section id="contact" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          8. Contact Information
        </h2>
        <p className="mt-3">
          If you have questions or concerns regarding these Terms of Service, please reach out to us at:{" "}
          <a
            href="mailto:support@shortlynk.in"
            className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            support@shortlynk.in
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
