const showAlert = require('./alert.js');

const signup = async (firstName, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: firstName,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm,
      }),
    });
    const result = await res.json();
    // console.log(result);

    if (res.ok) {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', result.message);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showAlert('error', 'An error occurred');
  }
};

module.exports = signup;
