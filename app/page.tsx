'use client';

import { useMemo, useState } from 'react';

type ToneOption = 'balanced' | 'urgent' | 'hopeful' | 'investigative';

type SectionOption = 'Editorial' | 'Op-Ed' | 'Community Voice';

interface FormState {
  headline: string;
  section: SectionOption;
  tone: ToneOption;
  urgency: string;
  evidence: string;
  personalAngle: string;
  callToAction: string;
  closingRemark: string;
}

const toneDescriptors: Record<ToneOption, { label: string; description: string }> = {
  balanced: {
    label: 'সামঞ্জস্যপূর্ণ',
    description: 'মাপা ভাষায় যৌক্তিক বিশ্লেষণ তুলে ধরে'
  },
  urgent: {
    label: 'জরুরি',
    description: 'দ্রুত পদক্ষেপের প্রয়োজনীয়তা জোর দিয়ে বলে'
  },
  hopeful: {
    label: 'আশাবাদী',
    description: 'সমাধান ও ইতিবাচক উদাহরণ সামনে আনে'
  },
  investigative: {
    label: 'তদন্তমুখী',
    description: 'তথ্য ও প্রমাণের সূক্ষ্ম বিশ্লেষণ দেয়'
  }
};

const sectionGuidance: Record<SectionOption, string> = {
  Editorial: 'সম্পাদক বরাবর চিঠির জন্য প্রাসঙ্গিক, সংক্ষিপ্ত ও প্রমাণ-সমৃদ্ধ যুক্তি প্রাধান্য পায়।',
  'Op-Ed': 'Op-Ed এ বিশ্লেষণ, তত্ত্বগত দৃষ্টিভঙ্গি ও নীতিমালা নিয়ে স্পষ্ট অবস্থান গঠন জরুরি।',
  'Community Voice': 'কমিউনিটি ভয়েস বিভাগে ব্যক্তিগত অভিজ্ঞতা ও সমাধানের প্রস্তাব জোরালোভাবে তুলে ধরতে হয়।'
};

const guidelineChecklist = [
  'বিষয়টির সাম্প্রতিকতা ও প্রাসঙ্গিকতা স্পষ্টভাবে তুলে ধরা হয়েছে।',
  'দাবি সমর্থনকারী কমপক্ষে দুইটি পরিমিত তথ্য উল্লেখ করা হয়েছে।',
  'গঠনমূলক সমাধান বা আহ্বান পরিষ্কারভাবে জানানো হয়েছে।',
  'ব্যক্তিগত অভিজ্ঞতা বা অনন্য দৃষ্টিভঙ্গি দিয়ে চিঠি আলাদা করা হয়েছে।',
  'ভাষা বিনয়ী, সংক্ষিপ্ত এবং সম্পাদকের জন্য সহজপাচ্য রাখা হয়েছে।'
];

function scoreReadiness(form: FormState) {
  const wordCount = (value: string) => (value.trim() ? value.trim().split(/\s+/).length : 0);
  const completeness =
    ['headline', 'urgency', 'evidence', 'personalAngle', 'callToAction', 'closingRemark'].reduce(
      (acc, key) => acc + (form[key as keyof FormState].trim() ? 1 : 0),
      0
    ) / 6;

  const detail =
    (wordCount(form.evidence) * 0.6 + wordCount(form.personalAngle) * 0.4) / 120;
  const nuance = form.tone === 'balanced' ? 1 : form.tone === 'hopeful' ? 0.9 : 0.85;
  const actionability = Math.min(wordCount(form.callToAction) / 45, 1);

  const acceptanceScore = Math.round(
    (completeness * 0.35 + Math.min(detail, 1) * 0.3 + nuance * 0.2 + actionability * 0.15) * 100
  );

  const tier =
    acceptanceScore >= 85
      ? 'উৎকৃষ্ট'
      : acceptanceScore >= 70
        ? 'প্রস্তুত'
        : acceptanceScore >= 55
          ? 'পরিমার্জন প্রয়োজন'
          : 'পুনর্বিবেচনা জরুরি';

  const suggestions: string[] = [];

  if (!form.evidence.trim()) {
    suggestions.push('নির্ভরযোগ্য তথ্য, উদ্ধৃত প্রতিবেদন বা সংখ্যাগত প্রমাণ যোগ করুন।');
  }
  if (wordCount(form.personalAngle) < 40) {
    suggestions.push('ব্যক্তিগত অভিজ্ঞতার বিস্তারিত তুলে ধরুন যাতে সম্পাদক আলাদা মূল্য খুঁজে পান।');
  }
  if (!form.callToAction.trim()) {
    suggestions.push('পাঠক ও কর্তৃপক্ষের জন্য স্পষ্ট আহ্বান উল্লেখ করুন।');
  }
  if (!form.closingRemark.trim()) {
    suggestions.push('ভদ্র ও স্মরণীয় উপসংহার যোগ করুন যাতে চিঠি পেশাদার দেখায়।');
  }

  return {
    acceptanceScore,
    tier,
    suggestions
  };
}

function createSubjectLine(form: FormState) {
  const base = form.headline.trim() || 'সমসাময়িক অভিমত';
  const section = form.section === 'Op-Ed' ? 'Op-Ed' : 'সম্পাদক বরাবর';
  return `${section}: ${base}`;
}

function formatEvidence(evidence: string) {
  const items = evidence
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!items.length) {
    return '';
  }

  return items
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');
}

function craftLetter(form: FormState) {
  const subject = createSubjectLine(form);
  const evidenceBlock = formatEvidence(form.evidence);
  const personal = form.personalAngle.trim();
  const callToAction = form.callToAction.trim();
  const closing = form.closingRemark.trim() || 'শুভেচ্ছান্তে,\nএকজন সচেতন পাঠক';

  const introLines = [
    form.section === 'Community Voice' ? 'প্রিয় সম্পাদক,' : 'মাননীয় সম্পাদক,',
    form.urgency.trim()
      ? `সম্প্রতি ${form.urgency.trim()} বিষয়ে যেভাবে আলোচনার ঝড় উঠেছে, তাতে একটি দায়িত্বশীল দৃষ্টিভঙ্গি সামনে আনা জরুরি বলে মনে করি।`
      : 'সমসাময়িক প্রেক্ষাপটে একটি জরুরি বিষয় নিয়ে আপনার দৃষ্টি আকর্ষণ করছি।'
  ];

  const toneHint =
    form.tone === 'urgent'
      ? 'ক্ষেত্রটি দ্রুত নীতিগত ও সামাজিক মনোযোগ দাবি করে।'
      : form.tone === 'hopeful'
        ? 'যথাযথ পদক্ষেপ নিলে ইতিবাচক পরিবর্তনের পথ খুলে যেতে পারে।'
        : form.tone === 'investigative'
          ? 'এই প্রসঙ্গে প্রাপ্ত তথ্যগুলো পুনর্মূল্যায়ন করা প্রয়োজন।'
          : 'বিষয়টিতে ভারসাম্যপূর্ণ ও তথ্যভিত্তিক আলাপচিত্র তৈরির প্রয়োজন রয়েছে।';

  const body = [
    introLines.join(' '),
    personal
      ? `নিজের অভিজ্ঞতা থেকে বলছি, ${personal}`
      : 'এই প্রসঙ্গে বিভিন্ন স্তরের মানুষের অভিজ্ঞতা থেকেই বিষয়টি বুঝতে শিখেছি।',
    evidenceBlock
      ? `প্রাসঙ্গিক বিবরণগুলো একত্র করে বেশ কিছু তথ্য পাওয়া যায়:\n${evidenceBlock}`
      : 'এই প্রসঙ্গে আরও অনুসন্ধানযোগ্য অনেক তথ্য রয়েছে যা আলোচনায় আসা জরুরি।',
    callToAction
      ? `সুতরাং ${callToAction}`
      : 'সম্পাদকীয় নীতির আলোকে এ বিষয়ে একটি গভীরতর আলোচনার সূচনা করতে পারে প্রথম আলো।',
    `আমি বিশ্বাস করি, ${toneHint}`,
    closing
  ];

  return `প্রাপক: সম্পাদক, প্রথম আলো\nবিষয়: ${subject}\n\n${body.join('\n\n')}`;
}

export default function Page() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormState>({
    headline: 'ডিজিটাল নিরাপত্তা আইনের মানবাধিকার প্রভাব',
    section: 'Editorial',
    tone: 'balanced',
    urgency: 'ডিজিটাল নিরাপত্তা আইন সংশোধনের বিতর্ক আবারও নতুন করে সামনে এসেছে',
    evidence: [
      '২০২৩ সালে তথ্য অধিকার ফোরামের জরিপে দেখা যায়, ৬২% সাংবাদিক আত্মনিয়ন্ত্রণে বাধ্য হয়েছেন',
      'মানবাধিকার কমিশনের সাম্প্রতিক রিপোর্টে বলা হয়েছে, দ্রুত বিচার ট্রাইব্যুনালে মামলার সংখ্যা আগের বছরের তুলনায় ১৮% বেড়েছে'
    ].join('\n'),
    personalAngle:
      'স্থানীয় সাংবাদিক হিসেবে অনেক সহকর্মীকে আইনের ভয় দেখিয়ে প্রতিবেদন স্থগিত করতে বাধ্য হতে দেখেছি, যা গণমাধ্যমের স্বাধীনতা সীমিত করে।',
    callToAction:
      'আইনের ধারা ২১ ও ২৫ সংশোধনে নাগরিক প্রতিনিধি, সাংবাদিক সংগঠন ও আইন বিশেষজ্ঞদের যৌথ সংলাপ জরুরি বলে মনে করি।',
    closingRemark:
      'প্রথম আলোর সম্পাদকীয় পাতায় এই আলোচনা আরও গভীর করার আহ্বান জানাই।\nশ্রদ্ধাভরে,\nমো. রাশেদুল ইসলাম'
  });

  const acceptance = useMemo(() => scoreReadiness(form), [form]);
  const letter = useMemo(() => craftLetter(form), [form]);
  const subjectLine = useMemo(() => createSubjectLine(form), [form]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <main>
      <div className="grid" style={{ gap: '1.2rem' }}>
        <span className="chip">প্রথম আলো সম্পাদক বরাবর চিঠি পরিকল্পনা টুল</span>
        <h1>গ্রহণযোগ্য চিঠি তৈরির স্মার্ট সহকারী</h1>
        <p>
          কোন চিঠি প্রথম আলো সহজে গ্রহণ করবে? এখানে আপনার বিষয়, প্রমাণ এবং ব্যক্তিগত অভিজ্ঞতা
          লিখলেই একটি পেশাদার মানের চিঠির কাঠামো তৈরি হয়ে যাবে। স্কোরিং মডেল জানিয়ে দেবে
          গ্রহণযোগ্যতার সম্ভাবনা কতটুকু এবং কোথায় আরও উন্নয়ন দরকার।
        </p>
      </div>

      <form>
        <label>
          আলোচ্য বিষয়/শিরোনাম
          <input
            type="text"
            value={form.headline}
            onChange={(event) => handleChange('headline', event.target.value)}
            placeholder="বিষয়ের সংক্ষিপ্ত শিরোনাম লিখুন"
          />
        </label>

        <div className="grid grid-cols">
          <label>
            বিভাগ নির্বাচন
            <select
              value={form.section}
              onChange={(event) => handleChange('section', event.target.value as SectionOption)}
            >
              <option value="Editorial">Editorial</option>
              <option value="Op-Ed">Op-Ed</option>
              <option value="Community Voice">Community Voice</option>
            </select>
          </label>

          <label>
            টোন নির্বাচন
            <select
              value={form.tone}
              onChange={(event) => handleChange('tone', event.target.value as ToneOption)}
            >
              <option value="balanced">সামঞ্জস্যপূর্ণ</option>
              <option value="urgent">জরুরি</option>
              <option value="hopeful">আশাবাদী</option>
              <option value="investigative">তদন্তমুখী</option>
            </select>
          </label>
        </div>

        <section>
          <strong>বিভাগভিত্তিক দিকনির্দেশনা</strong>
          <p>{sectionGuidance[form.section]}</p>
          <p>
            টোন: <em>{toneDescriptors[form.tone].label}</em> — {toneDescriptors[form.tone].description}
          </p>
        </section>

        <label>
          প্রাসঙ্গিকতা ও জরুরিতা
          <textarea
            value={form.urgency}
            onChange={(event) => handleChange('urgency', event.target.value)}
            placeholder="কেন এখনই লেখাটি গুরুত্বপূর্ণ তা ব্যাখ্যা করুন"
          />
        </label>

        <label>
          তথ্য ও প্রমাণ (প্রতি লাইনে একটি তথ্য)
          <textarea
            value={form.evidence}
            onChange={(event) => handleChange('evidence', event.target.value)}
            placeholder="উদাহরণ:\n• সাম্প্রতিক কোনো জরিপ বা গবেষণা ফলাফল\n• সংশ্লিষ্ট পরিসংখ্যান বা নীতিমালা উদ্ধৃতি"
          />
        </label>

        <label>
          ব্যক্তিগত দৃষ্টিভঙ্গি বা অভিজ্ঞতা
          <textarea
            value={form.personalAngle}
            onChange={(event) => handleChange('personalAngle', event.target.value)}
            placeholder="ব্যক্তিগত অভিজ্ঞতা বা ভিন্নধর্মী পর্যবেক্ষণ উল্লেখ করুন"
          />
        </label>

        <label>
          করণীয় বা আহ্বান
          <textarea
            value={form.callToAction}
            onChange={(event) => handleChange('callToAction', event.target.value)}
            placeholder="নীতি, সমাজ বা পাঠকের জন্য আহ্বান লিখুন"
          />
        </label>

        <label>
          উপসংহার ও স্বাক্ষর
          <textarea
            value={form.closingRemark}
            onChange={(event) => handleChange('closingRemark', event.target.value)}
            placeholder="ভদ্র উপসংহার ও স্বাক্ষর লিখুন"
          />
        </label>
      </form>

      <section className="acceptance">
        <span className="chip">গ্রহণযোগ্যতা বিশ্লেষণ</span>
        <strong>{acceptance.acceptanceScore}% সম্ভাবনা</strong>
        <p>বর্তমান ইনপুট অনুযায়ী অবস্থা: {acceptance.tier}</p>
        {acceptance.suggestions.length > 0 && (
          <div className="checklist">
            {acceptance.suggestions.map((item) => (
              <span key={item}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <span className="chip">প্রস্তাবিত বিষয়শিরোনাম</span>
        <p>{subjectLine}</p>
      </section>

      <section>
        <span className="chip">চিঠির খসড়া</span>
        <pre>{letter}</pre>
        <button type="button" onClick={handleCopy}>
          {copied ? 'কপি ✅' : 'কপি করুন'}
        </button>
      </section>

      <section>
        <span className="chip">গৃহীত হওয়ার চেকলিস্ট</span>
        <div className="checklist">
          {guidelineChecklist.map((guideline) => (
            <span key={guideline}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 13l4 4L19 7" />
              </svg>
              {guideline}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
