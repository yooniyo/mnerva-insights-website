const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Contact form route
app.post('/contact', async (req, res) => {
    try {
        const { firstName, lastName, email, company, inquiryType, message, privacy, communications } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !message || !privacy) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields and accept the privacy policy.' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a valid email address.' 
            });
        }

        // Email content
        const emailContent = `
            New contact form submission from MNerva Insights website:
            
            Name: ${firstName} ${lastName}
            Email: ${email}
            Company: ${company || 'Not provided'}
            Inquiry Type: ${inquiryType || 'Not specified'}
            
            Message:
            ${message}
            
            Privacy Policy Accepted: ${privacy ? 'Yes' : 'No'}
            Communications Consent: ${communications ? 'Yes' : 'No'}
            
            Submitted at: ${new Date().toLocaleString()}
        `;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || 'hello@mnervainsights.com',
            subject: `New Contact Form Submission - ${firstName} ${lastName}`,
            text: emailContent,
            replyTo: email
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Thank you for your message. We\'ll get back to you soon!' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error sending your message. Please try again later.' 
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Success page route
app.get('/success', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Thank You - MNerva Insights</title>
            <style>
                body { font-family: Inter, sans-serif; margin: 0; padding: 40px; background: #f8fafc; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #1e40af; margin-bottom: 20px; }
                p { color: #64748b; line-height: 1.6; margin-bottom: 30px; }
                .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; transition: background 0.3s; }
                .btn:hover { background: #1d4ed8; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Thank You!</h1>
                <p>We've received your message and will get back to you soon.</p>
                <a href="/" class="btn">Return to Home</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});