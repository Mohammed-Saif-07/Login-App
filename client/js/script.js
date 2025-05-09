document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = this.querySelector('button[type="submit"]');
  
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  
    try {
      const response = await fetch('http://127.0.0.1:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for sessions/cookies
      });
  
      const data = await response.json();
      
      if (response.ok) {
        showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html'; // Update this to your actual dashboard path
        }, 1500);
      } else {
        showNotification(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
      console.error('Login error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });