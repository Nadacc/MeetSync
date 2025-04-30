import nodemailer from 'nodemailer';

const sendReminderEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
  });
};

const generateReminderEmailHTML = (meetingTitle, meetingTime) => {
  return `
    <p>Dear attendee,</p>
    <p>This is a reminder that the meeting titled "<strong>${meetingTitle}</strong>" will start in 30 minutes at <strong>${meetingTime}</strong>.</p>
    <p>Please make sure to join on time.</p>
    <p>Best regards,<br>MeetSync</p>
  `;
};

export { sendReminderEmail, generateReminderEmailHTML };
