import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const logOutBtn = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.login-form');
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

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

// if (userDataForm) {
//   userDataForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     document.querySelector('.btn--save ').textContent = 'Saving ...';
//     const form = new FormData();
//     form.append('name', document.getElementById('name').value);
//     form.append('email', document.getElementById('email').value);
//     form.append('photo', document.getElementById('photo').files[0]);

//     await updateSettings(form, 'data');
//     console.log(form);

//     document.querySelector('.btn--save ').textContent = 'Save Settings';
//   });
// }
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log('from userDataForm');

    // Logging the FormData key-value pairs
    for (let [key, value] of form.entries()) {
      console.log(key, value);
    }

    updateSettings(form, 'data');
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
    console.log(tourId);
    console.log(button.dataset);

    try {
      await bookTour(tourId);
      button.textContent = 'Booked';
    } catch (error) {
      button.textContent = 'Try Again';
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });
}
