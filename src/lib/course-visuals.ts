const BASE_MENTOR_PHOTO_STYLE = [
  "Use case: photorealistic-natural.",
  "Asset type: production website marketing photography.",
  "Style/medium: premium editorial photo with real human subjects.",
  "Subject: an experienced mentor or instructor in AI, data, cloud, or software, approachable, credible, and sharply professional.",
  "Composition/framing: mentor is the focal point, natural candid posture, clean depth of field, polished production website composition.",
  "Lighting/mood: soft daylight or premium studio-office lighting, warm, trustworthy, aspirational.",
  "Constraints: real human skin texture, realistic hands, realistic eyes, natural facial proportions, subtle crimson and cyan accents only in the environment, no illustration, no CGI look, no waxy skin, no duplicate faces, no surreal effects, no text overlays, no watermark.",
].join(' ');

export const HOME_VALUE_MENTOR_PROMPT =
  `Senior AI and data mentor guiding two professionals through dashboards and workflow strategy in a refined modern workspace, one mentor clearly leading the session, authentic human interaction, confident but natural expressions. ${BASE_MENTOR_PHOTO_STYLE}`;

export const HIRE_HERO_MENTOR_PROMPT =
  `Respected technical mentor and placement advisor reviewing candidate portfolios with a small group of data and cloud professionals, mentor at the center of the frame, premium office setting, polished leadership energy. ${BASE_MENTOR_PHOTO_STYLE}`;

const COURSE_VISUALS: Record<string, { prompt: string; subtitle: string }> = {
  "Data Engineering Masterclass": {
    prompt: `Senior data engineering mentor teaching two learners beside pipeline architecture screens, data flow diagrams visible in the background, mentor-led explanation moment, premium learning environment. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Mentor-led pipeline engineering with Spark, Kafka, and Airflow.",
  },
  "AI & Machine Learning Ops": {
    prompt: `Experienced MLOps mentor coaching a small team while reviewing model deployment dashboards, production metrics on screens, mentor clearly guiding the conversation, calm high-end technical setting. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Learn MLOps from a mentor who works with production systems.",
  },
  "Full-Stack Data Solutions": {
    prompt: `Full-stack data mentor standing with one developer and one analyst, reviewing backend architecture and analytics UI together, mentor-led product build session, crisp modern workspace. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Build full data products with guidance from a hands-on mentor.",
  },
  "Predictive Analytics for Business": {
    prompt: `Business analytics mentor presenting forecasting insights to two professionals in a polished boardroom, mentor leading the strategy discussion, realistic dashboards and executive learning atmosphere. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Business forecasting taught through mentor-led decision making.",
  },
  "Cloud Architecture & Security": {
    prompt: `Cloud security mentor guiding a focused architecture review with one learner, infrastructure diagrams and secure systems visible behind them, enterprise-grade environment, mentor framed as the expert lead. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Architect secure cloud systems with an expert mentor.",
  },
  "Natural Language Processing": {
    prompt: `NLP mentor explaining language model behavior to a small group, text analysis interfaces and multilingual datasets nearby, photoreal human teaching moment in an advanced research-style workspace. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Learn NLP from a mentor working with modern language systems.",
  },
};

export const getMentorPortraitVisual = ({
  name,
  role,
  company,
}: {
  name: string;
  role: string;
  company?: string;
}) => ({
  prompt: `Head-and-shoulders portrait of ${name}, an accomplished ${role}${company ? ` at ${company}` : ''}, presented as a trusted technology mentor for a production website profile image, direct but natural eye contact, relaxed confident expression, premium wardrobe, seamless studio-office background blur. ${BASE_MENTOR_PHOTO_STYLE}`,
  subtitle: `${role}${company ? ` at ${company}` : ''}`,
});

export const getCourseVisual = (title: string) =>
  COURSE_VISUALS[title] || {
    prompt: `Senior technology mentor leading a focused training session tailored to ${title}, realistic learners, premium educational campaign photography, mentor clearly positioned as the guide. ${BASE_MENTOR_PHOTO_STYLE}`,
    subtitle: "Mentor-led professional training for modern data careers.",
  };
