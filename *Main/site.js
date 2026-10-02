document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const mainMenu = document.getElementById('main-menu');
menuButton?.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    mainMenu.classList.toggle('is-open', !expanded);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
        menuButton.setAttribute('aria-expanded', 'false');
        mainMenu.classList.remove('is-open');
        menuButton.focus();
    }
});
const requestedInquiry = new URLSearchParams(window.location.search).get('inquiry');
const inquirySelect = document.getElementById('inquiryType');
if (inquirySelect && Array.from(inquirySelect.options).some(option => option.value === requestedInquiry)) {
    inquirySelect.value = requestedInquiry;
}
// Form submission handler for Formspree
        document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            const successMessage = document.getElementById('successMessage');
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Show success message
                    this.style.display = 'none';
                    successMessage.style.display = 'block';
                    successMessage.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert('There was an error sending your message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again.');
            } finally {
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        