import hbs from 'handlebars';
import fetch from 'node-fetch';

export default {
    id: 'telegram-notifications',
    name: 'Telegram Notifications',
    description: 'Get host alerts via Telegram',
    iconUrlOrBase64: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGl2ZWxsb18xIiBkYXRhLW5hbWU9IkxpdmVsbG8gMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDI0MCAyNDAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMTIwIiB5MT0iMjQwIiB4Mj0iMTIwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMWQ5M2QyIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzhiMGUzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHRpdGxlPlRlbGVncmFtX2xvZ288L3RpdGxlPjxjaXJjbGUgY3g9IjEyMCIgY3k9IjEyMCIgcj0iMTIwIiBmaWxsPSJ1cmwoI2xpbmVhci1ncmFkaWVudCkiLz48cGF0aCBkPSJNODEuMjI5LDEyOC43NzJsMTQuMjM3LDM5LjQwNnMxLjc4LDMuNjg3LDMuNjg2LDMuNjg3LDMwLjI1NS0yOS40OTIsMzAuMjU1LTI5LjQ5MmwzMS41MjUtNjAuODlMODEuNzM3LDExOC42WiIgZmlsbD0iI2M4ZGFlYSIvPjxwYXRoIGQ9Ik0xMDAuMTA2LDEzOC44NzhsLTIuNzMzLDI5LjA0NnMtMS4xNDQsOC45LDcuNzU0LDAsMTcuNDE1LTE1Ljc2MywxNy40MTUtMTUuNzYzIiBmaWxsPSIjYTljNmQ4Ii8+PHBhdGggZD0iTTgxLjQ4NiwxMzAuMTc4LDUyLjIsMTIwLjYzNnMtMy41LTEuNDItMi4zNzMtNC42NGMuMjMyLS42NjQuNy0xLjIyOSwyLjEtMi4yLDYuNDg5LTQuNTIzLDEyMC4xMDYtNDUuMzYsMTIwLjEwNi00NS4zNnMzLjIwOC0xLjA4MSw1LjEtLjM2MmEyLjc2NiwyLjc2NiwwLDAsMSwxLjg4NSwyLjA1NSw5LjM1Nyw5LjM1NywwLDAsMSwuMjU0LDIuNTg1Yy0uMDA5Ljc1Mi0uMSwxLjQ0OS0uMTY5LDIuNTQyLS42OTIsMTEuMTY1LTIxLjQsOTQuNDkzLTIxLjQsOTQuNDkzcy0xLjIzOSw0Ljg3Ni01LjY3OCw1LjA0M0E4LjEzLDguMTMsMCwwLDEsMTQ2LjEsMTcyLjVjLTguNzExLTcuNDkzLTM4LjgxOS0yNy43MjctNDUuNDcyLTMyLjE3N2ExLjI3LDEuMjcsMCwwLDEtLjU0Ni0uOWMtLjA5My0uNDY5LjQxNy0xLjA1LjQxNy0xLjA1czUyLjQyNi00Ni42LDUzLjgyMS01MS40OTJjLjEwOC0uMzc5LS4zLS41NjYtLjg0OC0uNC0zLjQ4MiwxLjI4MS02My44NDQsMzkuNC03MC41MDYsNDMuNjA3QTMuMjEsMy4yMSwwLDAsMSw4MS40ODYsMTMwLjE3OFoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=",
    longDescriptionMD: `
# Setup guide

Go to [https://t.me/@BotFather](https://t.me/@BotFather) and type


    /newbot


Enter name like a hothost and username like hothost_bot


Copy bot token e.g.

    512345678:AABBCC11DD2233AGDGGji11Y1e32r8W124Eq0

And paste in setting below:

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
        id: "botToken",
        name: "Telegram Token created by BotFather",
        required: true,
        inputType: "url",
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
          default_value: "👌🏼 {{ HOST_NAME }}: Disk usage recovered\n Now it is used {{DISK_USED}} / {{DISK_TOTAL}}",
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
          default_value: "👌🏼 {{ HOST_NAME }}: Host back online",
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
          default_value: "👌🏼 {{ HOST_NAME }}: RAM usage recovered\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}",
          required: false,
          type: "text",
      },
    ],

    async handleEvent({ eventType, data, settings }) {
      const botToken = settings.params.botToken;
      const template = this.hbs.compile(settings.params[`${eventType}_message`]);
      const text = template(data);

      const firstResp = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
      });

      const chatId = firstResp.result.r[0]?.chat?.id;

      const secondResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
      });

    },

    


};