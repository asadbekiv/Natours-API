


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

    // If data is not a FormData object, set the appropriate headers
    if (!(data instanceof FormData)) {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const res = await response.json();

    if (response.ok) {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    } else {
      showAlert('error', res.message || 'Something went wrong!');
    }
  } catch (error) {
    showAlert('error', 'Failed to update settings!');
  }
};

module.exports = updateSettings;
