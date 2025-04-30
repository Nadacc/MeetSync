import { sendReminderEmail, generateReminderEmailHTML } from './Reminder.js';
import cron from 'node-cron';


export const scheduleReminderEmail = (meeting) => {
  const { attendees, title, startTime } = meeting;
  

  const reminderTime = new Date(startTime).getTime() - 30 * 60 * 1000; 
  const now = new Date().getTime();

  
  if (reminderTime <= now) {
    console.log(`Reminder time for meeting "${title}" has already passed, sending reminder now.`);
    sendReminderNow(meeting);
    return;
  }

 
  const timeToReminder = reminderTime - now;

  
  const subject = `Reminder: ${title} starts in 30 minutes`;
  const html = generateReminderEmailHTML(title, new Date(startTime).toLocaleTimeString());

  console.log(`Scheduling reminder email for meeting "${title}" at: ${new Date(reminderTime).toLocaleString()}`);

  
  setTimeout(() => {
    sendReminderNow(meeting);
  }, timeToReminder);
};


const sendReminderNow = (meeting) => {
  const { attendees, title, startTime } = meeting;
  const subject = `Reminder: ${title} starts in 30 minutes`;
  const html = generateReminderEmailHTML(title, new Date(startTime).toLocaleTimeString());

 
  attendees.forEach((attendeeEmail) => {
    sendReminderEmail({
      to: attendeeEmail,
      subject,
      html,
    }).catch((error) => console.error(`Error sending reminder to ${attendeeEmail}:`, error));
  });
};
