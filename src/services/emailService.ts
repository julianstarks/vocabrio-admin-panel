// Email webhook service for sending feedback notifications

export interface EmailFeedbackData {
  rating: number;
  feedback: string;
  translationCount: number;
  sessionDuration: number;
  joinBeta: boolean;
  userAgent: string;
  timestamp: string;
}

// Send feedback via webhook (you can use services like Formspree, EmailJS, or Netlify Forms)
export const sendFeedbackEmail = async (feedbackData: EmailFeedbackData): Promise<{ success: boolean; message: string }> => {
  try {
    // Option 1: Using Formspree (replace with your Formspree endpoint)
    const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your actual Formspree form ID
    
    const emailBody = `
🌟 NEW VOCABRIO FEEDBACK RECEIVED! 🌟

⭐ Rating: ${feedbackData.rating}/5 stars
📝 Feedback: ${feedbackData.feedback || 'No additional feedback provided'}
🔢 Translation Count: ${feedbackData.translationCount}
⏱️ Session Duration: ${Math.floor(feedbackData.sessionDuration / 60)} minutes
🧪 Beta Interest: ${feedbackData.joinBeta ? 'YES - Wants to join beta!' : 'No'}
🌐 Browser: ${feedbackData.userAgent}
📅 Timestamp: ${feedbackData.timestamp}

---
Sent from Vocabrio Universal Translator
    `;

    const response = await fetch(formspreeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `Vocabrio Feedback: ${feedbackData.rating} stars - ${feedbackData.translationCount} translations`,
        message: emailBody,
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
        translationCount: feedbackData.translationCount,
        joinBeta: feedbackData.joinBeta
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Feedback email sent successfully!' };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending feedback email:', error);
    
    // Fallback: Try alternative webhook service
    try {
      return await sendFeedbackViaNetlifyForms(feedbackData);
    } catch (fallbackError) {
      console.error('Fallback email service also failed:', fallbackError);
      return { 
        success: false, 
        message: 'Failed to send email notification, but feedback was saved to database.' 
      };
    }
  }
};

// Alternative: Netlify Forms (if deployed on Netlify)
const sendFeedbackViaNetlifyForms = async (feedbackData: EmailFeedbackData): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('form-name', 'vocabrio-feedback');
  formData.append('rating', feedbackData.rating.toString());
  formData.append('feedback', feedbackData.feedback);
  formData.append('translationCount', feedbackData.translationCount.toString());
  formData.append('joinBeta', feedbackData.joinBeta.toString());
  formData.append('timestamp', feedbackData.timestamp);

  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData as any).toString()
  });

  if (response.ok) {
    return { success: true, message: 'Feedback sent via Netlify Forms!' };
  } else {
    throw new Error('Netlify Forms submission failed');
  }
};

// Setup instructions for email services
export const getEmailSetupInstructions = () => {
  return {
    formspree: {
      name: 'Formspree (Recommended)',
      steps: [
        '1. Go to https://formspree.io and create a free account',
        '2. Create a new form and get your form ID',
        '3. Replace YOUR_FORM_ID in emailService.ts with your actual form ID',
        '4. Formspree will send emails to your registered email address'
      ],
      pros: ['Easy setup', 'Free tier available', 'Reliable delivery', 'Spam protection']
    },
    netlify: {
      name: 'Netlify Forms',
      steps: [
        '1. Deploy your app to Netlify',
        '2. Add a hidden form to your HTML with name="vocabrio-feedback"',
        '3. Netlify will automatically handle form submissions',
        '4. Check your Netlify dashboard for submissions'
      ],
      pros: ['No external service needed', 'Built into Netlify', 'Free with Netlify hosting']
    },
    emailjs: {
      name: 'EmailJS',
      steps: [
        '1. Go to https://emailjs.com and create an account',
        '2. Set up an email service (Gmail, Outlook, etc.)',
        '3. Create an email template',
        '4. Get your service ID, template ID, and public key'
      ],
      pros: ['Direct email sending', 'Template customization', 'Multiple email services']
    }
  };
};