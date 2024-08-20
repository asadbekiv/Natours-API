// const { login, logout } = require('./login.js');
const { login, logout } = require('./login.js');
const signup = require('./signup.js');
const updateSettings = require('./updateSettings.js');
const bookTour = require('./stripe.js');
const showAlert = require('./alert.js');

const logOutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    const submitButton = document.querySelector('.btn--save');
    if (submitButton) {
      submitButton.textContent = 'Creating...';
      submitButton.disabled = true;
    }
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    try {
      await signup(name, email, password, passwordConfirm);

      // Reset form fields after successful signup
      signupForm.reset();
    } catch (error) {
      console.error('Error during signup:', error);
    } finally {
      if (submitButton) {
        submitButton.textContent = 'Sign up';
        submitButton.disabled = false;
      }
    }
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save ').textContent = 'Saving ...';
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');

    document.querySelector('.btn--save ').textContent = 'Save Settings';
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent =
      'Updating,waite ...';
    // Added missing semicolons and fixed declaration syntax
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    const button = e.target;
    button.textContent = `Processing.... `;
    button.disabled = true;
    const { tourId } = button.dataset;

    try {
      await bookTour(tourId);
      button.textContent = 'Booked';
    } catch (error) {
      button.textContent = 'Try Again';
      showAlert('Booking Failed', error.message);
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) showAlert('success', alertMessage, 20);
