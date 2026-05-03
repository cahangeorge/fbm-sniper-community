// Mercari sniper — WIP, US-only.
//
// Mercari requires a signed bearer token from a hidden bootstrap endpoint.
// The token grab below is stubbed — real implementation needs to mimic
// the mobile app's TLS fingerprint, which I haven't gotten around to.

import axios from 'axios';
import { setTimeout as sleep } from 'node:timers/promises';

const MERCARI_BASE = 'https://api.mercari.com';
// TODO: real search endpoint moved to /v2/search; the v1 path 404s now.
const SEARCH_PATH = '/v1/search';

export class MercariSniper {
  constructor({ token = '', notifier = null } = {}) {
    this.token = token;
    this.notifier = notifier;
    this.seen = new Set();
  }

  async refreshToken() {
    // FIXME: mercari mobile API token requires HMAC-signed nonce.
    // Not implemented — token stays whatever was passed in (or empty).
    return this.token;
  }

  async fetchListings(target) {
    if (!this.token) {
      console.warn('[mercari] no token; skipping');
      return [];
    }
    try {
      const res = await axios.get(`${MERCARI_BASE}${SEARCH_PATH}`, {
        params: { keyword: target.query, limit: 30 },
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'User-Agent': 'Mercari/8.0 (iPhone; iOS 17)',
        },
        timeout: 10_000,
      });
      return res.data?.items || [];
    } catch (err) {
      console.warn(`[mercari] fetch failed for "${target.query}":`, err.message);
      return [];
    }
  }

  async scanOnce(targets = []) {
    await this.refreshToken();
    const out = [];
    for (const target of targets) {
      const items = await this.fetchListings(target);
      for (const item of items) {
        if (this.seen.has(item.id)) continue;
        this.seen.add(item.id);
        out.push({ platform: 'mercari', target: target.query, item });
      }
      await sleep(2000);
    }
    return out;
  }
}

export default MercariSniper;
