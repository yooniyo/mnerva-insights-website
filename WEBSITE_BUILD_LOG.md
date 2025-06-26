# MNerva Insights Website Build Log

## Project Overview
Built a professional consulting website for MNerva Insights, focusing on women's leadership and behavioral science consulting.

## Latest Updates (January 2025)

### Animation Enhancement
- **"Evidence meets empathy" visual metaphor**: Created two colored shapes that slide in from opposite sides and meet in the middle, representing evidence meeting empathy
- **Blue and pink wavy shapes**: Organic flowing patterns that converge at the tagline
- **Timing**: Left shape (evidence) and right shape (empathy) start simultaneously and meet perfectly in center

### Professional Design Refinements
- **Typography**: Switched to Georgia serif font for expensive, established consulting look
- **Color palette**: Refined to vibrant indigo (#6366f1), grey pink (#ec4899), modern cyan (#06b6d4)
- **Contact section**: Yale blue background with bright gold headings for premium feel
- **Removed green**: Replaced with light blue (#60a5fa) for consistency

### Vector Icons for Approach Section
Created custom CSS vector icons:
- **Evidence-Based**: Data chart with bars (blue background)
- **Experience-Centered**: Target/bullseye (pink background) 
- **Potential-Seeking**: Diamond shape (cyan background)
- **Result-Accelerating**: Arrow pointing right (light blue background)

### Mobile Optimization
- **Logo size increased**: 35px → 55px for better visibility
- **Hero title enlarged**: 2.5rem → 2.8rem with line wrapping
- **Icons bigger**: 50px → 60px on mobile
- **Single column layouts** for all grids
- **Wider buttons**: 80% width, stacked vertically
- **Better spacing** throughout

### Content Updates
- **Updated messaging**: AI-proof career advancement focus
- **Services reordered**: Now Approach → Services → Team → Contact
- **Team expertise refined**: Cleaner, more strategic language
- **Contact section**: Enhanced boutique firm description

## Key Features Implemented
- Modern, sleek design with sophisticated color palette
- Responsive single-page layout optimized for mobile
- "Evidence meets empathy" animation with meeting shapes
- Professional contact form with comprehensive fields
- Privacy policy popup integration
- Vector icons for visual hierarchy
- Mobile-first responsive design

## Final Color Palette
```css
:root {
    --primary: #6366f1;        /* Vibrant indigo */
    --secondary: #ec4899;      /* Grey pink */
    --accent: #06b6d4;        /* Modern cyan */
    --success: #60a5fa;        /* Light blue (replaced green) */
    --dark: #1f2937;          /* Sophisticated dark */
    --medium: #6b7280;        /* Professional grey */
    --light: #f9fafb;         /* Clean background */
    --white: #ffffff;
    --text-primary: #1f2937;  /* Main text color */
    --text-secondary: #6b7280; /* Secondary text */
}
```

## Brand Messaging
- **Main tagline:** "Evidence meets empathy" (solid Yale blue, single line)
- **Subtitle:** "Women's strengths amplified" (italicized, lighter weight)
- **Philosophy:** "We don't fix leaders. We amplify their natural flow"
- **Approach:** Behavioral science-driven transformation that invites change

## Services Focus (Final Order)
1. **Organizational Consulting** - Comprehensive assessment and strategy
2. **Leadership Coaching** - AI-proof career advancement
3. **Team Building Training** - Evidence-based interventions
4. **Relational Wellness Class** - Workplace relationship navigation

## Technical Implementation

### File Structure
```
consulting-website/
├── index.html                    # Main website file
├── styles.css                    # All styling and animations
├── logo-brand-black-transparent.svg  # Header logo
├── logo-brand-white-transparent.svg  # Footer logo
├── svg MNerva Transparent/       # Logo variants folder
├── data icon.png                 # Approach icons
├── centered icon.jpg
├── potential icon.jpg
├── result icon.png
├── background-no animation.jpeg  # Water background image
└── WEBSITE_BUILD_LOG.md         # This documentation
```

### Key Animations
- **"Evidence meets empathy" animation**: Two shapes slide from opposite sides and meet
- **Subtle hover effects**: 1-2px movements, color fills
- **Button animations**: Gradient fills and smooth transitions
- **Vector icons**: Professional geometric shapes with brand colors
- **Mobile-optimized**: Reduced animations for touch devices

### Contact Form Features
- First name & Last name (side by side)
- Email with validation
- Company field
- Inquiry type dropdown (maps to services)
- Message textarea
- Privacy policy agreement (required)
- Email communications opt-in (optional)
- **Aligned headings**: "Get Started" and "Send us a message" perfectly aligned

### Mobile Responsiveness
- **Large logo**: 55px on mobile for visibility
- **Readable text**: Increased font sizes across the board
- **Single column**: All grids stack on mobile
- **Touch-friendly**: Larger buttons and tap targets
- **Optimized spacing**: Better use of mobile screen space

## Hosting & Deployment
- **Platform:** Netlify (free tier)
- **Repository:** GitHub
- **Domain:** mnervainsights.com
- **Email:** Google Workspace integration maintained
- **SSL:** Automatic HTTPS via Netlify

## Design Philosophy
- **Premium consulting aesthetic**: Georgia serif font, sophisticated colors
- **Professional but approachable**: Warm colors, thoughtful animations
- **Evidence-based branding**: Visual metaphors support messaging
- **Mobile-first**: Optimized for all device sizes
- **Conversion-focused**: Clear CTAs and contact forms

## Content Strategy Updates
- **AI-proof messaging**: Emphasis on future-ready career development
- **Boutique positioning**: Referral-based, expert-driven approach
- **Global reach**: "Clients across the globe since 2014"
- **Behavioral science focus**: Removed cultural intelligence terminology
- **Results-oriented**: Powerful mechanisms that deliver outcomes

### Logo Integration Best Practices
- SVG files in dedicated folder for organization
- Transparent backgrounds with proper scaling
- Different versions for light/dark backgrounds
- Mobile-optimized sizing

### Animation Technical Details
```css
/* Evidence meets empathy animation */
.floating-water::before {
    /* Left shape (Evidence) - slides right */
    animation: slideFromLeft 3s ease-out 0.5s forwards;
}

.floating-water::after {
    /* Right shape (Empathy) - slides left */
    animation: slideFromRight 3s ease-out 0.5s forwards;
}
```

## Future Maintenance Guidelines
- **Color updates**: Modify CSS variables in `:root` section
- **Content changes**: Update HTML directly or through GitHub
- **Logo updates**: Replace SVG files in folder structure
- **Mobile testing**: Always test on actual devices
- **Performance**: Monitor loading times and optimize images

## Lessons Learned
1. **Animation subtlety**: Less is more for professional consulting
2. **Mobile-first approach**: Logo visibility crucial on small screens
3. **Color psychology**: Premium colors convey expertise and trust
4. **Content hierarchy**: Clear section flow improves user experience
5. **Typography matters**: Serif fonts add gravitas for consulting firms

## Quick Reference Commands
```bash
# Open local preview
open /Users/yushi/consulting-website/index.html

# Find specific CSS rules
grep -n "class-name" /Users/yushi/consulting-website/styles.css

# Upload to GitHub: drag all files including SVG folder
```

---
*Built: December 2024*  
*Major Updates: January 2025*  
*Framework: Vanilla HTML/CSS with Netlify hosting*  
*Mobile Optimized: Yes*  
*Animation: Evidence meets empathy visual metaphor*