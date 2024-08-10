// import axios from 'axios';
const Stripe = require('stripe');
const showAlert = require('./alert.js')

const stripe = Stripe(
  'pk_test_51PgObBByYH3XmrRBBl0CvF5uO0nI00oLcJmrXvJf7v3BysfmP61ocP6MeEZZy765iQlw7ICM8vT47ateDSMVZWfb00hTJXDfNb',
);

// export const bookTour = async (tourId) => {
//   try {
//     // Get checkout session endpoint APi
//     const session = await axios(
//       `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
//     );
//     // Create checkout from+credit card

//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });
//   } catch (error) {
//     console.log(error);
//     showAlert('Error happened !', error);
//   }
// };

const bookTour = async (tourId) => {
  try {
    // Get checkout session from API endpoint
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );

    const session = await response.json();

    if (!response.ok) {
      throw new Error(session.message || 'Failed to create checkout session');
    }

    // Redirect to Stripe checkout
    await stripe.redirectToCheckout({
      sessionId: session.session.id,
    });
  } catch (error) {
    console.error(error);
    showAlert('error', error.message);
  }
};

module.exports = bookTour;
