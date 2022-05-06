import hbs from 'handlebars';
import fetch from 'node-fetch';

export default {
    id: 'slack-notifications',
    name: 'Slack Notifications',
    description: 'Get host alerts via Slack',
    iconUrlOrBase64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI3IiBoZWlnaHQ9IjEyNyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjcuMiA4MGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjJDNi43IDkzLjIuOCA4Ny4zLjggODBjMC03LjMgNS45LTEzLjIgMTMuMi0xMy4yaDEzLjJWODB6bTYuNiAwYzAtNy4zIDUuOS0xMy4yIDEzLjItMTMuMiA3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzNjMCA3LjMtNS45IDEzLjItMTMuMiAxMy4yLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMlY4MHoiIGZpbGw9IiNFMDFFNUEiLz4KICA8cGF0aCBkPSJNNDcgMjdjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMkMzMy44IDYuNSAzOS43LjYgNDcgLjZjNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yVjI3SDQ3em0wIDYuN2M3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDEzLjlDNi42IDYwLjEuNyA1NC4yLjcgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJINDd6IiBmaWxsPSIjMzZDNUYwIi8+CiAgPHBhdGggZD0iTTk5LjkgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjIgNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yIDAgNy4zLTUuOSAxMy4yLTEzLjIgMTMuMkg5OS45VjQ2Ljl6bS02LjYgMGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjEzLjhDNjYuOSA2LjUgNzIuOC42IDgwLjEuNmM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzMuMXoiIGZpbGw9IiMyRUI2N0QiLz4KICA8cGF0aCBkPSJNODAuMSA5OS44YzcuMyAwIDEzLjIgNS45IDEzLjIgMTMuMiAwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjk5LjhoMTMuMnptMC02LjZjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMiAwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJoMzMuMWM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDgwLjF6IiBmaWxsPSIjRUNCMjJFIi8+Cjwvc3ZnPgo=",
    longDescriptionMD: `
## Setup guide

First of all go to [Slack Webhooks App page](https://devforth.slack.com/apps/A0F7XDUAZ-incoming-webhooks) and add click "Add to Slack" button.
Select a channel on which you want to receive notifications and copy webhook url to field below
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
            id: "webhook",
            name: "Slack Web Hook URL",
            description: "Click Add to Slack on this page and copy WebHook ",
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
            id: "ram_is_almost_full",
            name: "What message will be shown when you get ram_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: RAM is almoast full\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_is_almost_full",
            name: "What message will be shown when you get ram_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: RAM ussage recovered\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}",
            required: false,
            type: "text",
        },
    ],

    configuration: {},

    async onPluginEnabled() {
        hbs.registerHelper('add', (a, b) => {
            return +a + +b;
        });
        hbs.registerHelper('sizeFormat', (a) => {
            let value = parseInt(a);
            for (let unit of ['B', 'KiB', 'MiB', 'GiB', 'TiB']) {
                if (Math.abs(value) < 1024) {
                    return `${value.toFixed(2)} ${unit}`;
                }

                value /= 1024;
            }

            return `${value.toFixed(2)} PiB`;
        });
    },
    async onPluginDisable() {
    },
    async handleEvent({ eventType, data, configuration }) {
        const webhookUrl = configuration.params.webhook;
        const template = hbs.compile(configuration.params[`${eventType}_message`]);
        const text = template(data);

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }),
        })
    },
};