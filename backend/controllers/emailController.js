import { getEmailSuggestions } from "../services/emailService.js";  

export const searchEmails = async (req, res) => {
  const query = req.query.query || '';

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required.' });
  }

  try {
    const emailSuggestions = await getEmailSuggestions(query); 
    res.json(emailSuggestions);
  } catch (error) {
    console.error('Error fetching email suggestions:', error);
    res.status(500).json({ message: 'Error fetching email suggestions' });
  }
};
