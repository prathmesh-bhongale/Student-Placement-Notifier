const replies = [
  [/eligib/i, 'Eligibility is based on your 10th/12th/diploma/semester 6 percentages, backlogs and required skills. Open a drive card on your dashboard to see exactly why you are (or are not) eligible.'],
  [/apply|application/i, 'Open the Dashboard, find a drive you are eligible for and click "Apply". You can see everything you applied to under the "Applied" tab.'],
  [/save|bookmark/i, 'Click the bookmark icon on any drive card to save it. Saved drives are in the "Saved" tab.'],
  [/profile|update|edit/i, 'Go to Profile from the top menu to update your marks, backlogs, skills and contact details. Better data means better matches.'],
  [/password|login|forgot/i, 'If you forgot your password please contact your Training & Placement Officer.'],
  [/notif|email/i, 'You will receive an email when a drive matching your profile is announced.'],
  [/hello|hi|hey/i, 'Hello! 👋 I can help with eligibility, applying to drives, saving drives and your profile.'],
];

exports.chat = (req, res) => {
  const message = String(req.body?.message || '').slice(0, 500);
  if (!message.trim()) return res.status(400).json({ status: 'error', message: 'Message is required' });
  const match = replies.find(([re]) => re.test(message));
  res.json({
    status: 'success',
    data: { reply: match ? match[1] : 'I can help with eligibility, applying, saving drives and your profile. Try asking about one of those!' },
  });
};
