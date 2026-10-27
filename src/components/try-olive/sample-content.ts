import type { SampleMemory } from "@/components/memory/sample-memory-context";
import memories from "./sample-memories.json";

// Standalone reusable template; no patient record or connection to a doctor's account.
export const SAMPLE_MEMORIES = memories as SampleMemory[];

export function sampleScript(language: "en" | "bn") {
    return language === "bn" ? [
        ["ডাক্তার", "আসুন, বসুন। কী সমস্যা নিয়ে এসেছেন?"],
        ["রোগী", "তিন-চার দিন ধরে জ্বর। রাতে, বিশেষ করে ভোরের দিকে বেশি হয়।"],
        ["ডাক্তার", "থার্মোমিটারে মেপেছেন? জ্বরের সঙ্গে মাথাব্যথা, শরীরব্যথা বা কাশি আছে?"],
        ["রোগী", "হ্যাঁ, একশ দুই পর্যন্ত উঠেছিল। মাথা আর শরীর ব্যথা করে। হালকা শুকনো কাশি আছে, নাক দিয়েও একটু পানি পড়ে।"],
        ["ডাক্তার", "বমি হয়েছে? পাতলা পায়খানা, পেটব্যথা, রক্তপাত বা শ্বাসকষ্ট হচ্ছে?"],
        ["রোগী", "একবার বমি হয়েছিল, এখনও একটু বমি বমি লাগে। পাতলা পায়খানা হয়নি। পেটব্যথা, রক্তপাত বা শ্বাসকষ্ট নেই। খাওয়ার রুচি কম, তবে পানি খেতে পারছি।"],
        ["ডাক্তার", "আগে থেকে ডায়াবেটিস, উচ্চ রক্তচাপ বা হাঁপানি আছে? নিয়মিত কোনো ওষুধ খান? ওষুধে অ্যালার্জি আছে?"],
        ["রোগী", "আমার এসব রোগ নেই, কোনো নিয়মিত ওষুধও খাই না। জানা কোনো অ্যালার্জি নেই। বাবার ডায়াবেটিস আছে। এই জ্বরের জন্য এখনও ওষুধ খাইনি।"],
        ["ডাক্তার", "আপনার প্রেসার, পালস আর তাপমাত্রা দেখে নিচ্ছি। এখন ডেঙ্গুর মৌসুম, তাই ডেঙ্গুর সম্ভাবনাও দেখতে হবে। আজ সিবিসি আর ডেঙ্গু এনএস ওয়ান অ্যান্টিজেন পরীক্ষা করবেন। রিপোর্ট না দেখে নিশ্চিত করে বলছি না।"],
        ["রোগী", "আচ্ছা। জ্বর আর সর্দির জন্য কী ওষুধ খাব?"],
        ["ডাক্তার", "এই প্রেসক্রিপশনে নাপা পাঁচশ মিলিগ্রাম এক ট্যাবলেট করে দিনে তিনবার লিখছি। মন্টেলুকাস্ট দশ মিলিগ্রাম রাতে একটা, আর ফেক্সো একশ আশি মিলিগ্রাম দিনে একটা। ওআরএস প্যাকেটের নির্দেশ অনুযায়ী পানিতে গুলে খাবেন। ওষুধের তালিকা আর কতদিন চলবে, রিপোর্টের সময় আবার দেখে নেব।"],
        ["রোগী", "খাওয়া-দাওয়া আর বিশ্রামের ব্যাপারে কী করব? আবার কবে আসব?"],
        ["ডাক্তার", "পানি ও তরল খাবার খাবেন, দুই-তিন দিন বিশ্রাম নেবেন। কাল রিপোর্ট নিয়ে আসবেন। তীব্র পেটব্যথা, বারবার বমি, রক্তপাত বা শ্বাসকষ্ট হলে অপেক্ষা করবেন না, হাসপাতালে যাবেন।"],
        ["রোগী", "ঠিক আছে, আজ পরীক্ষাগুলো করে কাল রিপোর্ট নিয়ে আসব। ধন্যবাদ।"],
    ] : [
        ["Doctor", "Please sit down. What brings you in today?"],
        ["Patient", "I've had a fever for three or four days. It's worse at night, especially towards dawn."],
        ["Doctor", "Have you measured it? Any headache, body aches or cough?"],
        ["Patient", "It reached 102 degrees Fahrenheit. My head and body ache. I have a mild dry cough and a slightly runny nose."],
        ["Doctor", "Any vomiting, diarrhoea, abdominal pain, bleeding or breathing difficulty?"],
        ["Patient", "I vomited once and still feel a little nauseated. No diarrhoea, abdominal pain, bleeding or breathing difficulty. My appetite is poor, but I can drink water."],
        ["Doctor", "Do you have diabetes, high blood pressure or asthma? Any regular medicines or medicine allergies?"],
        ["Patient", "None of those conditions, no regular medicines and no known allergies. My father has diabetes. I haven't taken anything for this fever yet."],
        ["Doctor", "I'll check your blood pressure, pulse and temperature. Dengue is a possibility this season. Please get a CBC and Dengue NS1 antigen test today. We need the results before confirming the diagnosis."],
        ["Patient", "What should I take for the fever and runny nose?"],
        ["Doctor", "For this prescription, I'm writing Napa 500 mg, one tablet three times daily; montelukast 10 mg, one tablet at night; and Fexo 180 mg, one tablet daily. Prepare ORS exactly as directed on the packet. We'll review the medicines and their duration with your results."],
        ["Patient", "What about food and rest? When should I come back?"],
        ["Doctor", "Drink water and fluids and rest for two or three days. Bring your results tomorrow. Seek hospital care without waiting if you develop severe abdominal pain, repeated vomiting, bleeding or breathing difficulty."],
        ["Patient", "All right. I'll have the tests today and bring the results tomorrow. Thank you."],
    ];
}

export type SampleHighlight = "medicine" | "instruction" | "investigation" | "clinical";
export const SAMPLE_HIGHLIGHTS: Record<"en" | "bn", [string, SampleHighlight][]> = {
    bn: [
        ["নাপা পাঁচশ মিলিগ্রাম", "medicine"], ["মন্টেলুকাস্ট দশ মিলিগ্রাম", "medicine"],
        ["ফেক্সো একশ আশি মিলিগ্রাম", "medicine"], ["ওআরএস", "medicine"],
        ["এক ট্যাবলেট করে দিনে তিনবার", "instruction"], ["রাতে একটা", "instruction"],
        ["দিনে একটা", "instruction"], ["প্যাকেটের নির্দেশ অনুযায়ী পানিতে গুলে খাবেন", "instruction"],
        ["সিবিসি", "investigation"], ["ডেঙ্গু এনএস ওয়ান অ্যান্টিজেন", "investigation"],
        ["তিন-চার দিন ধরে জ্বর", "clinical"], ["রাতে, বিশেষ করে ভোরের দিকে বেশি হয়", "clinical"],
        ["একশ দুই পর্যন্ত উঠেছিল", "clinical"], ["মাথা আর শরীর ব্যথা করে", "clinical"],
        ["হালকা শুকনো কাশি", "clinical"], ["নাক দিয়েও একটু পানি পড়ে", "clinical"],
        ["একবার বমি হয়েছিল", "clinical"], ["এখনও একটু বমি বমি লাগে", "clinical"],
        ["পাতলা পায়খানা হয়নি", "clinical"], ["পেটব্যথা, রক্তপাত বা শ্বাসকষ্ট নেই", "clinical"],
        ["জানা কোনো অ্যালার্জি নেই", "clinical"], ["বাবার ডায়াবেটিস আছে", "clinical"],
        ["ডেঙ্গুর সম্ভাবনা", "clinical"], ["রিপোর্ট না দেখে নিশ্চিত করে বলছি না", "clinical"],
        ["পানি ও তরল খাবার খাবেন", "clinical"], ["দুই-তিন দিন বিশ্রাম নেবেন", "clinical"],
        ["কাল রিপোর্ট নিয়ে আসবেন", "clinical"],
        ["তীব্র পেটব্যথা, বারবার বমি, রক্তপাত বা শ্বাসকষ্ট হলে অপেক্ষা করবেন না, হাসপাতালে যাবেন", "clinical"],
    ],
    en: [
        ["Napa 500 mg", "medicine"], ["montelukast 10 mg", "medicine"], ["Fexo 180 mg", "medicine"], ["ORS", "medicine"],
        ["one tablet three times daily", "instruction"], ["one tablet at night", "instruction"],
        ["one tablet daily", "instruction"], ["exactly as directed on the packet", "instruction"],
        ["CBC", "investigation"], ["Dengue NS1 antigen", "investigation"],
        ["fever for three or four days", "clinical"], ["worse at night, especially towards dawn", "clinical"],
        ["102 degrees Fahrenheit", "clinical"], ["My head and body ache", "clinical"],
        ["mild dry cough", "clinical"], ["slightly runny nose", "clinical"],
        ["I vomited once", "clinical"], ["still feel a little nauseated", "clinical"],
        ["No diarrhoea, abdominal pain, bleeding or breathing difficulty", "clinical"],
        ["no regular medicines and no known allergies", "clinical"], ["My father has diabetes", "clinical"],
        ["Dengue is a possibility", "clinical"], ["We need the results before confirming the diagnosis", "clinical"],
        ["Drink water and fluids", "clinical"], ["rest for two or three days", "clinical"],
        ["Bring your results tomorrow", "clinical"],
        ["Seek hospital care without waiting if you develop severe abdominal pain, repeated vomiting, bleeding or breathing difficulty", "clinical"],
    ],
};
