import User from "../models/userModel.js";  // Correct import of the User model

export const getEmailSuggestions = async (query) => {
  try {
    const users = await User.find({
      email: { $regex: query, $options: 'i' } 
    }).limit(10); // Limit to 10 results

    return users.map(user => user.email);
  } catch (error) {
    throw new Error('Error fetching email suggestions');
  }
};
