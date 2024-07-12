// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

// import { login, logout } from './login';
// import updateSettings  from './updateSettings';

// const logOutBtn = document.querySelector('.nav__el--logout');
// const loginForm = document.querySelector('.login-form');
// const userDataForm = document.querySelector('.form-user-data');
// const userPasswordForm = document.querySelector('.form-user-password');

// if (loginForm)
//   loginForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
//   });

// if (logOutBtn) logOutBtn.addEventListener('click', logout);

// if (userDataForm)

//   userDataForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     // const form = new FormData();
//     // form.append('name', document.getElementById('name').value);
//     // form.append('email', document.getElementById('email').value);
//     // // form.append('photo', document.getElementById('photo').files[0]);
//     // console.log(form);

//     // updateSettings(form, 'data');

//     const name=document.getElementById('name').value,
//     const email=document.getElementById('email').value,
//     updateSettings({name,email},'data');

//   });

// if (userPasswordForm)
//   userPasswordForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const passwordCurrent=document.getElementById('password-current').value,
//     const password=document.getElementById('password').value,
//     const passwordConfirm=document.getElementById('password-confirm').value,

//     updateSettings({passwordCurrent,password,passwordConfirm},'password');
//   });

// // console.log('are you sure , parcel are you kiding me boy really a');

import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { login, logout } from './login';
import { updateSettings } from './updateSettings';

const logOutBtn = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.login-form');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save ').textContent = 'Saving ...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await updateSettings({ name, email }, 'data');

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

console.log('hi there');
