document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        // Client-side validation
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            e.preventDefault();
            alert('Please fill in all fields');
            return false;
        }
        
        // Additional validation can be added here
        return true;
    });
    
    // You can add more interactive features here
    // For example, password visibility toggle
    const passwordInput = document.getElementById('password');
    const togglePassword = document.createElement('span');
    togglePassword.textContent = '👁️';
    togglePassword.style.cursor = 'pointer';
    togglePassword.style.marginLeft = '10px';
    
    passwordInput.insertAdjacentElement('afterend', togglePassword);
    
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });
});