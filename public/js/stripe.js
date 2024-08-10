import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51PgObBByYH3XmrRBBl0CvF5uO0nI00oLcJmrXvJf7v3BysfmP61ocP6MeEZZy765iQlw7ICM8vT47ateDSMVZWfb00hTJXDfNb',
);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session endpoint APi
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    );
    // Create checkout from+credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('Error happened !', error);
  }
};
