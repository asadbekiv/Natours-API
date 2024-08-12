// const axios = require('axios');
const showAlert = require('./alert.js');
// import { showAlert } from './alert';

const login = async (email, password) => {
  console.log('Login initiated with:', email, password);
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const result = await response.json();
    console.log(result);

    if (response.ok /*&& result.status === 'success'*/) {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', result.message);
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('error', 'An error occurred');
  }
};

const logout = async () => {
  console.log('Logout initiated');
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/users/logout', {
      method: 'GET',
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      location.reload(true);
    } else {
      showAlert('error', 'Logout failed');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('error', 'Error logging out => try again later!');
  }
};

module.exports = { login, logout };
