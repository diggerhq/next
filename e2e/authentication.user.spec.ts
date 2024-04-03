import { expect, request, test } from '@playwright/test';
import { uniqueId } from 'lodash';
import { dashboardDefaultOrganizationIdHelper } from './helpers/dashboard-default-organization-id.helper';


const INBUCKET_URL = `http://localhost:54324`;


test.describe.serial('authentication group', () => {
  test('login works correctly', async ({ page }) => {


    // eg endpoint: https://api.testmail.app/api/json?apikey=${APIKEY}&namespace=${NAMESPACE}&pretty=true
    async function getConfirmEmail(username: string): Promise<{
      token: string;
      url: string
    }> {
      const requestContext = await request.newContext()
      const messages = await requestContext
        .get(`${INBUCKET_URL}/api/v1/mailbox/${username}`)
        .then((res) => res.json())
        // InBucket doesn't have any params for sorting, so here
        // we're sorting the messages by date
        .then((items) =>
          [...items].sort((a, b) => {
            if (a.date < b.date) {
              return 1
            }

            if (a.date > b.date) {
              return -1
            }

            return 0
          })
        );

      const latestMessageId = messages[0]?.id

      if (latestMessageId) {
        const message = await requestContext
          .get(
            `${INBUCKET_URL}/api/v1/mailbox/${username}/${latestMessageId}`
          )
          .then((res) => res.json())

        // We've got the latest email. We're going to use regular
        // expressions to match the bits we need.
        const token = message.body.text.match(/enter the code: ([0-9]+)/)[1]
        const url = message.body.text.match(/Log In \( (.+) \)/)[1]

        return { token, url }
      }

      throw new Error('No email received')
    }

    await page.goto(`/settings/security`);

    // read email value in the input field
    const emailInput = page.locator('input[name="email"]');
    const emailAddress = await emailInput.getAttribute('value');

    await page.goto(`/logout`);

    await page.goto(`/login`);

    const magicLinkButton = page.locator('button:has-text("Magic Link")');

    if (!magicLinkButton) {
      throw new Error('Magic Link button not found');
    }

    await magicLinkButton.click();

    if (!emailAddress) {
      throw new Error('Email is empty');
    }

    await page.getByTestId('magic-link-form').locator('input').fill(emailAddress);
    // await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Login with Magic Link' }).click();
    // check for this text - A magic link has been sent to your email!
    await page.waitForSelector('text=A magic link has been sent to your email!');
    const identifier = emailAddress.split('@')[0];
    let url;
    await expect.poll(async () => {
      try {
        const { url: urlFromCheck } = await getConfirmEmail(identifier);
        url = urlFromCheck;
        return typeof urlFromCheck;
      } catch (e) {
        return null;
      }
    }, {
      message: 'make sure the email is received',
      intervals: [1000, 2000, 5000, 10000, 20000],
    }).toBe('string')

    await page.goto(url);
    await dashboardDefaultOrganizationIdHelper({ page });
  });


  test('update password should work', async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto('/dashboard');
    // wait for the url to change to `/organization/<organizationUUID>`

    await page.goto(`/settings/security`);

    // read email value in the input field
    const emailInput = page.locator('input[name="email"]');
    const email = await emailInput.getAttribute('value');
    if (!email) {
      throw new Error('Email is empty');
    }
    const newPassword = `password-${uniqueId()}`;


    await page.fill('input[name="password"]', newPassword);
    await page.click('button:has-text("Update Password")');

    await page.waitForSelector('text=Password updated!');

    await page.goto(`/logout`);

    await page.goto(`/login`);

    await page.fill('input[data-strategy="email-password"]', email);
    // fill in the password
    await page.fill('input[name="password"]', newPassword);

    // click on button with text exact: Login
    await page.click('button:text-is("Login")')
    await page.waitForSelector('text=Logged in!')

    await page.waitForURL(`/dashboard`);
  });





  test("forgot password works correctly", async ({ page }) => {

    // eg endpoint: https://api.testmail.app/api/json?apikey=${APIKEY}&namespace=${NAMESPACE}&pretty=true
    async function getResetPasswordEmail(username: string): Promise<{
      url: string;
    }> {
      const requestContext = await request.newContext();
      const messages = await requestContext
        .get(`${INBUCKET_URL}/api/v1/mailbox/${username}`)
        .then((res) => res.json())
        // InBucket doesn't have any params for sorting, so here
        // we're sorting the messages by date
        .then((items) =>
          [...items].sort((a, b) => {
            if (a.date < b.date) {
              return 1;
            }

            if (a.date > b.date) {
              return -1;
            }

            return 0;
          }),
        );

      const latestMessageId = messages[0]?.id;

      if (latestMessageId) {
        const message = await requestContext
          .get(`${INBUCKET_URL}/api/v1/mailbox/${username}/${latestMessageId}`)
          .then((res) => res.json());

        // We've got the latest email. We're going to use regular
        // expressions to match the bits we need.

        // match this text and extract url
        // --------------\nReset password\n--------------\n\nFollow this link to reset the password for your user:\n\nReset password ( http://127.0.0.1:54321/auth/v1/verify?token=pkce_e2df68ace87a16abf48dd04aca116f9ee35612772ab190212a27ac88&type=recovery&redirect_to=http://localhost:3000/update-password )\n\nAlternatively, enter the code: 719963
        const url = message.body.text.match(/Reset password \( (.+) \)/)[1];

        return { url };
      }

      throw new Error("No email received");
    }

    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await dashboardDefaultOrganizationIdHelper({ page });

    await page.goto(`/settings/security`, { waitUntil: 'networkidle' });

    // read email value in the input field
    const emailInput = page.locator('input[name="email"]');
    const email = await emailInput.getAttribute("value");

    await page.goto(`/logout`);

    await page.goto(`/forgot-password`);

    if (!email) {
      throw new Error("Email is empty");
    }

    // fill in the email
    await page.fill('input[name="email"]', email);

    // click button with text Reset password
    await page.click('button:has-text("Reset password")');

    await page.waitForSelector(
      "text=A password reset link has been sent to your email!",
    );

    const identifier = email.split("@")[0];
    let url;
    await expect
      .poll(
        async () => {
          try {
            const { url: urlFromCheck } = await getResetPasswordEmail(identifier);
            url = urlFromCheck;
            return typeof urlFromCheck;
          } catch (e) {
            return null;
          }
        },
        {
          message: "make sure the email is received",
          intervals: [1000, 2000, 5000, 10000, 20000],
        },
      )
      .toBe("string");

    await page.goto(url);

    await page.waitForURL(`/update-password`);

    // wait for text = Reset Password
    await page.waitForSelector("text=Reset Password");

    // fill in a new password in the input field with name password
    const newPassword = "password";
    await page.fill('input[name="password"]', newPassword);

    // click on button with text Confirm Password
    await page.click('button:has-text("Confirm Password")');

    await page.waitForURL(`/dashboard`);

    await page.goto(`/logout`);

    await page.goto(`/login`);

    // find form element with data-testid password-form
    const form = await page.waitForSelector('form[data-testid="password-form"]');
    const emailInput2 = await form.$('input[data-strategy="email-password"]');
    const passwordInput = await form.$('input[name="password"]');

    if (!emailInput2) {
      throw new Error("Email input is empty");
    }

    if (!passwordInput) {
      throw new Error("Password input is empty");
    }

    await emailInput2.fill(email);
    // fill in the password
    await passwordInput.fill(newPassword);

    // click on button of type submit in form
    const submitButton = await form.waitForSelector('button[type="submit"]');

    if (!submitButton) {
      throw new Error("Submit button is empty");
    }

    await submitButton.click();

    await page.goto(`/settings/security`, { waitUntil: 'networkidle' });

  });

})
