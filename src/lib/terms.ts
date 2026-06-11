// Version string recorded against each clinician's acceptance. Bump this whenever
// the Terms and Conditions below change materially.
export const TERMS_VERSION = "1.0";

export const TERMS_TITLE = "Olive — Terms and Conditions";
export const TERMS_SUBTITLE = "Clinician Registration Agreement";

export interface TermsSection {
    heading: string;
    clauses: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
    {
        heading: "1. Acceptance of Terms",
        clauses: [
            "1.1 By completing registration on the Olive platform, you (\"Clinician\") agree to be bound by these Terms and Conditions. If you do not agree, you may not use the platform. Olive AI Private Limited (\"Olive\", \"we\", \"us\") reserves the right to update these terms at any time with notice provided via the registered contact.",
            "1.2 Condition of Access. Use of the platform is strictly limited to medical practitioners holding a valid, active, and unrestricted registration with the Bangladesh Medical and Dental Council (BMDC). By registering, the Clinician warrants that they hold a valid BMDC registration number and that this registration remains active throughout their use of the platform. Olive reserves the right to request verification of BMDC credentials and to suspend access if registration lapses, is revoked, or is suspended.",
        ],
    },
    {
        heading: "2. Nature of the Service",
        clauses: [
            "2.1 Olive provides an AI-assisted clinical documentation platform that records, transcribes, and processes doctor-patient consultation audio to generate structured prescription drafts. The Clinician remains solely responsible for all clinical decisions, final prescriptions, and patient care.",
            "2.2 Olive functions as a documentation assistant only. Olive is not a medical device, healthcare provider, physician, diagnostic system, or treatment provider. Olive does not diagnose, prescribe, recommend treatment, or make clinical decisions of any kind.",
            "2.3 The platform is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including but not limited to warranties of accuracy, fitness for a particular purpose, or uninterrupted availability.",
        ],
    },
    {
        heading: "3. Data Collection and Processing",
        clauses: [
            "3.1 Olive collects and processes consultation audio recordings, transcriptions, generated prescription content, patient information entered into the system, and usage data from interactions with the platform.",
            "3.2 This data is processed using third-party AI infrastructure including but not limited to Google Cloud services. Data is transmitted securely and stored on encrypted servers. The Clinician acknowledges that data may be processed and stored on infrastructure located outside Bangladesh as part of the service delivery. Olive will comply with applicable Bangladesh laws regarding cross-border data transfer as those laws are enacted and enforced.",
            "3.3 Olive may use anonymized and de-identified clinical data including consultation recordings, transcriptions, prescription content, and AI-generated outputs to improve platform performance, train and refine AI and machine learning models, and develop new features and products.",
            "3.4 Olive will never sell identifiable patient or clinician data to third parties for commercial purposes.",
            "3.5 The Clinician grants Olive a perpetual, worldwide, irrevocable, royalty-free license to use, reproduce, modify, analyze, aggregate, and process de-identified data derived from use of the platform for research, model training, product improvement, benchmarking, and development of future products and services. Once clinical data has been fully de-identified and incorporated into model training processes, it cannot be individually reversed, retrieved, or deleted.",
        ],
    },
    {
        heading: "4. Clinician Responsibility for Patient Consent",
        clauses: [
            "4.1 The Clinician is solely responsible for informing patients that their consultation is being recorded and processed by an AI system for documentation purposes, prior to initiating any recorded session.",
            "4.2 Prior to initiating a recorded consultation, Olive may require the Clinician to affirm that patient consent has been obtained. Such affirmation is provided solely by the Clinician and Olive does not independently verify consent.",
            "4.3 The Clinician must obtain appropriate consent from each patient in accordance with applicable laws and medical ethics standards including BMDC guidelines.",
            "4.4 Olive provides the technical platform only. Any legal or ethical obligations arising from recording patient consultations rest entirely with the Clinician.",
            "4.5 By using Olive, the Clinician warrants that they have obtained or will obtain patient consent as required and indemnifies Olive against any claims, penalties, or proceedings arising from failure to do so.",
        ],
    },
    {
        heading: "5. Data Retention and Deletion",
        clauses: [
            "5.1 Prescription records and patient data entered into Olive are retained for the duration of the Clinician's active subscription and for a reasonable period thereafter as determined by Olive's operational and legal requirements. Olive will communicate its current data retention policy and update Clinicians of any material changes.",
            "5.2 Clinicians may request deletion of their personal account data by contacting Olive support. Requests will be processed within 30 days subject to any legal obligations requiring retention.",
            "5.3 Anonymized data already incorporated into AI model training processes cannot be individually reversed or deleted as it no longer exists as identifiable personal data.",
        ],
    },
    {
        heading: "6. Confidentiality and Security",
        clauses: [
            "6.1 Olive implements industry-standard security measures including encrypted data transmission and secure cloud storage.",
            "6.2 Olive will not disclose identifiable clinician or patient data to any third party except as required by law, court order, or regulatory authority.",
            "6.3 In the event of a confirmed data breach affecting identifiable personal data, Olive will notify affected users within a reasonable timeframe and take commercially reasonable measures to investigate and mitigate the effects of the incident.",
        ],
    },
    {
        heading: "7. Account Security",
        clauses: [
            "7.1 The Clinician is responsible for safeguarding account credentials including login details and any associated authentication methods.",
            "7.2 The Clinician is responsible for all activities occurring under their account. Olive shall not be liable for any loss or damage arising from unauthorized account access resulting from the Clinician's failure to maintain credential security.",
            "7.3 The Clinician must notify Olive immediately upon becoming aware of any unauthorized use of their account.",
        ],
    },
    {
        heading: "8. Intellectual Property",
        clauses: [
            "8.1 All platform technology, AI models, software, pipelines, and interfaces are the intellectual property of Olive AI Private Limited.",
            "8.2 Clinical content generated through the platform — prescription drafts, summaries, notes — confirmed and saved by the Clinician belongs to the Clinician.",
            "8.3 Olive retains a perpetual, irrevocable, royalty-free license to use anonymized versions of platform-generated content for AI training and product improvement purposes as described in Section 3.5.",
            "8.4 Any suggestions, ideas, feature requests, or feedback provided by the Clinician may be used by Olive without restriction or compensation.",
        ],
    },
    {
        heading: "9. Limitation of Liability",
        clauses: [
            "9.1 Olive is a documentation assistance tool. All clinical decisions are the sole responsibility of the Clinician.",
            "9.2 Olive does not guarantee the accuracy or completeness of AI-generated prescription drafts. Clinician review and confirmation is mandatory before any prescription is considered final.",
            "9.3 The Clinician acknowledges that Olive's output is a machine-generated draft suggestion. It does not possess clinical intent. The act of confirming, saving, printing, or sending a prescription constitutes a fresh, independent, and legally binding medical act executed solely by the Clinician. Olive assumes no responsibility for errors, omissions, drug substitutions, or dosage discrepancies left uncorrected by the Clinician's review.",
            "9.4 Olive shall not be liable for any clinical outcome, patient harm, or professional consequence arising from use or misuse of the platform.",
            "9.5 To the maximum extent permitted by applicable law, Olive shall not be liable for any indirect, incidental, consequential, special, punitive, or loss-of-profit damages arising from use of the platform.",
            "9.6 Olive's total liability in any circumstance shall not exceed the total subscription fees paid by the Clinician in the three months preceding the claim.",
        ],
    },
    {
        heading: "10. Service Availability",
        clauses: [
            "10.1 Olive does not guarantee uninterrupted, error-free, or continuous availability of the platform. Service may be interrupted due to maintenance, technical failures, third-party infrastructure outages, or circumstances beyond Olive's reasonable control.",
            "10.2 Clinicians are responsible for maintaining appropriate backup procedures and alternative clinical workflows to manage periods of platform unavailability.",
        ],
    },
    {
        heading: "11. Suspension and Termination",
        clauses: [
            "11.1 Clinicians may cancel their subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are issued for partial months.",
            "11.2 Olive may suspend or terminate access immediately and without prior notice for violation of these Terms, non-payment, suspected misuse or fraudulent activity, legal or regulatory requirements, security concerns, or any conduct that Olive reasonably determines to be harmful to the platform or its users.",
            "11.3 Upon termination, the Clinician's access to the platform will cease. Data retention following termination is governed by Section 5.",
        ],
    },
    {
        heading: "12. Subscription and Pricing",
        clauses: [
            "12.1 Olive operates on a monthly subscription model. Payment is due at the start of each billing cycle.",
            "12.2 Early adopter pricing, where applicable, is locked for the duration of continuous active subscription. Cancellation and resubscription will result in pricing at the then-current rate.",
        ],
    },
    {
        heading: "13. Governing Law",
        clauses: [
            "13.1 These Terms are governed by the laws of the People's Republic of Bangladesh. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.",
        ],
    },
];
