document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  } else {
    console.error('Form element not found');
  }
});
// const axiso = require('axios');

const login = async (email, password) => {
  console.log(email, password);
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (result.data.status === 'success') {
      alert('logged in successfully asad');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

// document.querySelector('.form').addEventListener('submit', (e) => {
//   e.preventDefault();
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });
