// const axios = require('axios');
const showAlert = require('./alert.js');
// import { showAlert } from "./alert";

const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const options = {
      method: 'PATCH',
      body: data,
    };

    // If the data is not FormData, set headers for JSON
    if (!(data instanceof FormData)) {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (response.ok && result.status === 'success') {
      showAlert(
        'success',
        `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
      );
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    } else {
      showAlert('error', result.message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showAlert('error', 'Something went wrong');
  }
};

module.exports = updateSettings;
