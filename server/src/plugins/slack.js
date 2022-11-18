import hbs from 'handlebars';
import fetch from 'node-fetch';

export default {
    id: 'slack-notifications',  // this is just ID of plugin, should have slug format
    name: 'Slack Notifications',  // Plugin name
    description: 'Get host alerts via Slack',  // short description of what plugin allows to do
    
    // icon of plugin, here we use SVG coverted to base64
    iconUrlOrBase64: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI3IiBoZWlnaHQ9IjEyNyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjcuMiA4MGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjJDNi43IDkzLjIuOCA4Ny4zLjggODBjMC03LjMgNS45LTEzLjIgMTMuMi0xMy4yaDEzLjJWODB6bTYuNiAwYzAtNy4zIDUuOS0xMy4yIDEzLjItMTMuMiA3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzNjMCA3LjMtNS45IDEzLjItMTMuMiAxMy4yLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMlY4MHoiIGZpbGw9IiNFMDFFNUEiLz4KICA8cGF0aCBkPSJNNDcgMjdjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMkMzMy44IDYuNSAzOS43LjYgNDcgLjZjNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yVjI3SDQ3em0wIDYuN2M3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDEzLjlDNi42IDYwLjEuNyA1NC4yLjcgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJINDd6IiBmaWxsPSIjMzZDNUYwIi8+CiAgPHBhdGggZD0iTTk5LjkgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjIgNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yIDAgNy4zLTUuOSAxMy4yLTEzLjIgMTMuMkg5OS45VjQ2Ljl6bS02LjYgMGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjEzLjhDNjYuOSA2LjUgNzIuOC42IDgwLjEuNmM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzMuMXoiIGZpbGw9IiMyRUI2N0QiLz4KICA8cGF0aCBkPSJNODAuMSA5OS44YzcuMyAwIDEzLjIgNS45IDEzLjIgMTMuMiAwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjk5LjhoMTMuMnptMC02LjZjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMiAwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJoMzMuMWM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDgwLjF6IiBmaWxsPSIjRUNCMjJFIi8+Cjwvc3ZnPgo=",
    
    // detailed description for users how to integrate a plugin, should have info how to get security tokens, what to click and so on.
    // Markdown format
    longDescriptionMD: `
## Setup guide

First of all go to [Slack Webhooks App page](https://devforth.slack.com/apps/A0F7XDUAZ-incoming-webhooks) and add click "Add to Slack" button.
Select a channel on which you want to receive notifications and copy webhook url to field below.

Webhook is URL which look like this:

    https://hooks.slack.com/services/T00000/B00000/XXXXXXXXXXXXXXXXXXXXX


  `,

    // list of events which plugin receives
    supportedEvents: [
        'disk_is_almost_full',
        'disk_usage_recovered',
        'host_is_offline',
        'host_is_online',
        'ram_is_almost_full',
        'ram_usage_recovered',
        'http_host_down',
        'http_host_up',
        'ssl_is_almost_expire'
    ],

    // parameters which should be configured by user
    params: [
        {
            id: "webhook",
            name: "Slack Web Hook URL",
            notes: "See guide above to understand how to get it",
            required: true,
            inputType: "url",
            type: "str"
        },
        {
            id: "disk_is_almost_full_message",
            name: "What message will be shown when you get disk_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: {{HOST_LABEL}} Disk is almost full ({{ HOST_PUBLIC_IP }}) \n {{DISK_USED}} / {{DISK_TOTAL}}. Please clean it up",
            required: false,
            type: "text",
        },
        {
            id: "disk_usage_recovered_message",
            name: "What message will be shown when you get disk_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: {{HOST_LABEL}} Disk usage recovered\n Now it is used {{DISK_USED}} / {{DISK_TOTAL}}. Time required to fix: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "host_is_offline_message",
            name: "What message will be shown when you get host_is_offline alert",
            default_value: "⚠️ {{ HOST_NAME }}: {{HOST_LABEL}} Host is offline",
            required: false,
            type: "text",
        },
        {
            id: "host_is_online_message",
            name: "What message will be shown when you get host_is_online_message alert",
            default_value: "👌🏼 {{ HOST_NAME }}: {{HOST_LABEL}} Host back online, Downtime: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_is_almost_full_message",
            name: "What message will be shown when you get ram_is_almost_full alert",
            default_value: "⚠️ {{ HOST_NAME }}: {{HOST_LABEL}} RAM is almost full\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}",
            required: false,
            type: "text",
        },
        {
            id: "ram_usage_recovered_message",
            name: "What message will be shown when you get ram_usage_recovered alert",
            default_value: "👌🏼 {{ HOST_NAME }}: {{HOST_LABEL}} RAM usage recovered\n Now it is {{ RAM_USED }} / {{ RAM_TOTAL }}. Time required to fix: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "http_host_down_message",
            name: "What message will be shown when you get http_host_down alert",
            default_value: "⚠️ HTTP host {{ HOST_NAME }} {{ HOST_LABEL }} down. Reason: {{ EVENT_REASON }}",
            required: false,
            type: "text",
        },
        {
            id: "http_host_up_message",
            name: "What message will be shown when you get http_host_up alert",
            default_value: "👌🏼 HTTP host {{ HOST_NAME }} {{ HOST_LABEL }} back online. Reason: {{ EVENT_REASON }}. Downtime: {{ EVENT_DURATION }}",
            required: false,
            type: "text",
        },
        {
            id: "ssl_is_almost_expire_message",
            name: "What message will be shown when you get ssl_expire warning",
            default_value: "⚠️ SSL certificate of HTTP host {{ HOST_NAME }} {{ HOST_LABEL }} will expire soon. Certificate is valid until: {{CERT_VALID_UNTIL}} ",
            required: false,
            type: "text",
        },
    ],

    async sendMessage(settings, text) {
        if(!text) {
            text = '🔥 This is a test notification from HotHost';
        }
        const { webhook } = settings.params;
        await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                icon_url: "https://raw.githubusercontent.com/devforth/hothost/main/server/static/img/slack_ico.png",
                username: "HotHost",
                text: text,
            }),
        });
    },
    // executed once when plugin is enabled, could be used to perform some initialization of plugin
    async onPluginEnabled() {
        this.hbs = hbs.create();
    },

    // executed once when plugin is disabled
    async onPluginDisable() {
    },

    // main event handling is done here
    async handleEvent({ eventType, data, settings }) {
        const template = this.hbs.compile(settings.params[`${eventType}_message`], {noEscape: true});
        const text = template(data);

        try {
            this.sendMessage(settings, text);
        }
        catch (e) {console.log(e)}
    },
};