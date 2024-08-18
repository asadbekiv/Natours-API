(() => {
  var e = {},
    t = {};
  let o = () => {
    let e = document.querySelector('.alert');
    e && e.parentElement.removeChild(e);
  };
  t = (e, t) => {
    o();
    let r = `<div class="alert alert--${e}">${t}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', r),
      window.setTimeout(o, 5e3);
  };
  var r = (e = {
      login: async (e, o) => {
        console.log('Login initiated with:', e, o);
        try {
          let r = await fetch('/api/v1/users/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: e, password: o }),
            }),
            n = await r.json();
          console.log(n),
            r.ok
              ? (t('success', 'Logged in successfully!'),
                window.setTimeout(() => {
                  location.assign('/');
                }, 1500))
              : t('error', n.message);
        } catch (e) {
          console.error('Fetch error:', e), t('error', 'An error occurred');
        }
      },
      logout: async () => {
        console.log('Logout initiated');
        try {
          let e = await fetch('/api/v1/users/logout', { method: 'GET' }),
            o = await e.json();
          e.ok && 'success' === o.status
            ? location.reload(!0)
            : t('error', 'Logout failed');
        } catch (e) {
          console.error('Fetch error:', e),
            t('error', 'Error logging out => try again later!');
        }
      },
    }).login,
    n = e.logout,
    a = {};
  a = async (e, o, r, n) => {
    try {
      let a = await fetch('/api/v1/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: e,
            email: o,
            password: r,
            passwordConfirm: n,
          }),
        }),
        s = await a.json();
      a.ok
        ? (t('success', 'Account created successfully!'),
          window.setTimeout(() => {
            location.assign('/');
          }, 1500))
        : t('error', s.message);
    } catch (e) {
      console.error('Fetch error:', e), t('error', 'An error occurred');
    }
  };
  var s = {};
  s = async (e, o) => {
    try {
      let r =
          'password' === o
            ? '/api/v1/users/updateMyPassword'
            : '/api/v1/users/updateMe',
        n = { method: 'PATCH', body: e };
      e instanceof FormData ||
        ((n.headers = { 'Content-Type': 'application/json' }),
        (n.body = JSON.stringify(e)));
      let a = await fetch(r, n),
        s = await a.json();
      a.ok && 'success' === s.status
        ? (t(
            'success',
            `${o.charAt(0).toUpperCase() + o.slice(1)} updated successfully`,
          ),
          window.setTimeout(() => {
            location.assign('/me');
          }, 1500))
        : t('error', s.message || 'Something went wrong');
    } catch (e) {
      console.error('Fetch error:', e), t('error', 'Something went wrong');
    }
  };
  var d = {};
  d = async (e) => {
    try {
      let t = Stripe(
          'pk_test_51PgObBByYH3XmrRBBl0CvF5uO0nI00oLcJmrXvJf7v3BysfmP61ocP6MeEZZy765iQlw7ICM8vT47ateDSMVZWfb00hTJXDfNb',
        ),
        o = await fetch(`/api/v1/bookings/checkout-session/${e}`, {
          method: 'GET',
        }).then(function (e) {
          return e.json();
        });
      await t.redirectToCheckout({ sessionId: o.session.id });
    } catch (e) {
      console.error('Error:', e), t('Error happened!', e.message);
    }
  };
  let c = document.querySelector('.nav__el--logout'),
    l = document.querySelector('.form--signup'),
    i = document.querySelector('.form--login'),
    u = document.querySelector('.form-user-data'),
    m = document.querySelector('.form-user-password'),
    g = document.getElementById('book-tour');
  i &&
    i.addEventListener('submit', (e) => {
      e.preventDefault(),
        r(
          document.getElementById('email').value,
          document.getElementById('password').value,
        );
    }),
    l &&
      l.addEventListener('submit', async (e) => {
        let t = document.querySelector('.btn--save');
        t && ((t.textContent = 'Creating...'), (t.disabled = !0)),
          e.preventDefault();
        let o = document.getElementById('name').value,
          r = document.getElementById('email').value,
          n = document.getElementById('password').value,
          s = document.getElementById('passwordConfirm').value;
        try {
          await a(o, r, n, s), l.reset();
        } catch (e) {
          console.error('Error during signup:', e);
        } finally {
          t && ((t.textContent = 'Sign up'), (t.disabled = !1));
        }
      }),
    c && c.addEventListener('click', n),
    u &&
      u.addEventListener('submit', async (e) => {
        e.preventDefault(),
          (document.querySelector('.btn--save ').textContent = 'Saving ...');
        let t = new FormData();
        t.append('name', document.getElementById('name').value),
          t.append('email', document.getElementById('email').value),
          t.append('photo', document.getElementById('photo').files[0]),
          await s(t, 'data'),
          (document.querySelector('.btn--save ').textContent = 'Save Settings');
      }),
    m &&
      m.addEventListener('submit', async (e) => {
        e.preventDefault(),
          (document.querySelector('.btn--save-password').textContent =
            'Updating,waite ...');
        let t = document.getElementById('password-current').value,
          o = document.getElementById('password').value,
          r = document.getElementById('password-confirm').value;
        await s(
          { passwordCurrent: t, password: o, passwordConfirm: r },
          'password',
        ),
          (document.querySelector('.btn--save-password').textContent =
            'Save password'),
          (document.getElementById('password-current').value = ''),
          (document.getElementById('password').value = ''),
          (document.getElementById('password-confirm').value = '');
      }),
    g &&
      g.addEventListener('click', async (e) => {
        let t = e.target;
        (t.textContent = 'Processing.... '), (t.disabled = !0);
        let { tourId: o } = t.dataset;
        try {
          await d(o), (t.textContent = 'Booked');
        } catch (e) {
          (t.textContent = 'Try Again'),
            showAlert('Booking Failed', e.message),
            console.error(e);
        } finally {
          t.disabled = !1;
        }
      });
})();
//# sourceMappingURL=index.js.map
