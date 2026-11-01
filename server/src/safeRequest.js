import fetch from "node-fetch";
import sslChecker from "ssl-checker";
import {
  useAgent,
  RequestFilteringHttpsAgent,
} from "request-filtering-agent";

const IGNORE_SSL_ERRORS_AGENT_OPTIONS = { rejectUnauthorized: false };
const sslCheckAgent = new RequestFilteringHttpsAgent({ maxCachedSessions: 0 });

export const safeFetch = (url, { ignoreSslErrors, ...options } = {}) =>
  fetch(url, {
    ...options,
    agent: (parsedUrl) =>
      useAgent(
        parsedUrl.href,
        ignoreSslErrors ? IGNORE_SSL_ERRORS_AGENT_OPTIONS : undefined
      ),
  });

export const safeSslCheck = (host) => sslChecker(host, { agent: sslCheckAgent });
