// const Stripe = require('stripe');
const showAlert = require('./alert.js');

const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51PgObBByYH3XmrRBBl0CvF5uO0nI00oLcJmrXvJf7v3BysfmP61ocP6MeEZZy765iQlw7ICM8vT47ateDSMVZWfb00hTJXDfNb',
    );
    // Get checkout session from the API
    const res = await fetch(
      `/api/v1/bookings/checkout-session/${tourId}`,
      {
        method: 'GET',
      },
    ).then(function (respone) {
      return respone.json();
    });
  
    // console.log(res);

    // Redirect to checkout with Stripe
    await stripe.redirectToCheckout({
      sessionId: res.session.id,
    });
  } catch (error) {
    console.error('Error:', error);
    showAlert('Error happened!', error.message);
  }
};

module.exports = bookTour;
