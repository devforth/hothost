

import nodemailer from "nodemailer";
import hbs from 'handlebars';

export default {
    id: 'gmail-notifications',
    name: 'Gmail Notifications',
    description: 'Get alerts to defined E-mail addresses from your Gmail account',
    iconUrlOrBase64: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjUyIDQyIDg4IDY2Ij4KPHBhdGggZmlsbD0iIzQyODVmNCIgZD0iTTU4IDEwOGgxNFY3NEw1MiA1OXY0M2MwIDMuMzIgMi42OSA2IDYgNiIvPgo8cGF0aCBmaWxsPSIjMzRhODUzIiBkPSJNMTIwIDEwOGgxNGMzLjMyIDAgNi0yLjY5IDYtNlY1OWwtMjAgMTUiLz4KPHBhdGggZmlsbD0iI2ZiYmMwNCIgZD0iTTEyMCA0OHYyNmwyMC0xNXYtOGMwLTcuNDItOC40Ny0xMS42NS0xNC40LTcuMiIvPgo8cGF0aCBmaWxsPSIjZWE0MzM1IiBkPSJNNzIgNzRWNDhsMjQgMTggMjQtMTh2MjZMOTYgOTIiLz4KPHBhdGggZmlsbD0iI2M1MjIxZiIgZD0iTTUyIDUxdjhsMjAgMTVWNDhsLTUuNi00LjJjLTUuOTQtNC40NS0xNC40LS4yMi0xNC40IDcuMiIvPgo8L3N2Zz4=",
    longDescriptionMD: `
## Setup guide

Create a new Google account or use existing.

Go to the Google account settings (Click on avatar in top-right corner ➡️ "Manage your Google account" button).

First enable **2-Step Verification** if it is not enabled yet:

![](https://i.stack.imgur.com/YkUz1.png)

Then click on the **App passwords**.

![](https://i.stack.imgur.com/UM7Lt.png)

Select **Mail** as the app and then in device menu select **Other**, Enter "hothost"

![](https://i.stack.imgur.com/HLpiR.png)


Once done, click on the **GENERATE** button. You will see your generated app password.

![](https://i.stack.imgur.com/ITRnN.png)

Just copy the password and use it here.

  `,
  supportedEvents: [
        'disk_is_almost_full',
        'disk_usage_recovered',
        'host_is_offline',
        'host_is_online',
        'ram_is_almost_full',
        'ram_usage_recovered',
  ],

  params: [
        {
          id: "gmail_email",
          name: "Your Google E-mail address",
          notes: "Example: mymail@gmail.com",
          required: true,
          inputType: "email",
          type: "str"
        },
        {
          id: "google_account_passwod",
          name: "Password created in App passwords for your google account, see above",
          required: true,
          type: "str"
        },
        {
          id: "notify_emails",
          name: "Email on which you want to receive notifications",
          notes: "Could be one email address or multiple defined via comma, e.g. 'one@devforth.io, two@devforth.io'",
          required: true,
          type: "str"
        },
        {
            id: "disk_is_almost_full_message",
            name: "What message will be shown when you get disk_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: Disk is almost full ({{ HOST_PUBLIC_IP }}) \n {{DISK_USED}} / {{DISK_TOTAL}}. Please clean it up",
            required: false,
            type: "text",
        },
        {
            id: "disk_usage_recovered_message",
            name: "What message will be shown when you get disk_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: Disk usage recovered\n Now it is used {{DISK_USED}} / {{DISK_TOTAL}}. Time require to fix: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "host_is_offline_message",
            name: "What message will be shown when you get host_is_offline alert",
            default_value: "⚠️ {{ HOST_NAME }}: Host is offline",
            required: false,
            type: "text",
        },
        {
            id: "host_is_online_message",
            name: "What message will be shown when you get host_is_online_message alert",
            default_value: "👌🏼 {{ HOST_NAME }}: Host back online, Downtime: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_is_almost_full_message",
            name: "What message will be shown when you get ram_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: RAM is almost full\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_usage_recovered_message",
            name: "What message will be shown when you get ram_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: RAM usage recovered\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}. Time require to fix: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
  ],

  configuration: {},

  async onPluginEnabled() {
      this.hbs = hbs.create();
  },
  async onPluginDisable() {
  },
  async handleEvent({ eventType, data, settings }) {
    const template = this.hbs.compile(settings.params[`${eventType}_message`]);
    const text = template(data);

    const { gmail_email, google_account_passwod, notify_emails } = settings.params;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmail_email,
        pass: google_account_passwod,
      },
    });
    await transporter.sendMail({
      from: `"HotHost 🔥" <${gmail_email}>`, // sender address
      to: notify_emails, // list of receivers
      subject: text.slice(0, 60) + '...', // Subject line
      text: text, // plain text body
    });
  },
};
