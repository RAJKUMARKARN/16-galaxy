const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');

overlayBtn.addEventListener('click', () => {
  container.classList.toggle('right-panel-active');
  
  overlayBtn.classList.remove('btnScaled');
  window.requestAnimationFrame(() => {
    overlayBtn.classList.add('btnScaled');
});
});

const signUpForm = document.querySelector('.sign-up-container form');
const signInForm = document.querySelector('.sign-in-container form');

// Register User
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = signUpForm.querySelector('input[placeholder="Name"]').value;
  const email = signUpForm.querySelector('input[placeholder="Email"]').value;
  const password = signUpForm.querySelector('input[placeholder="Password"]').value;

  const response = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    alert('User registered successfully');
  } else {
    alert(data.error);
  }
});

// Login User
signInForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = signInForm.querySelector('input[placeholder="Email"]').value;
  const password = signInForm.querySelector('input[placeholder="Password"]').value;

  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token);  // Save JWT to local storage
    alert('Login successful');
    // Redirect to dashboard or protected page
  } else {
    alert(data.error);
  }
});
const token = localStorage.getItem('token');
fetch('http://localhost:3000/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

