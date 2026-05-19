// Vinted sniper — WIP. Multi-region Vinted listings poller.
//
// FIXME: Vinted started rotating their public API endpoint and CSRF token
// flow some time in late April. The cookie parsing below is broken since
// then. Leaving the structure here so a contributor can pick it up.

import axios from 'axios';
import { setTimeout as sleep } from 'node:timers/promises';

const VINTED_HOST_BY_REGION = {
  us: 'www.vinted.com',
  uk: 'www.vinted.co.uk',
  fr: 'www.vinted.fr',
  de: 'www.vinted.de',
  it: 'www.vinted.it',
  nl: 'www.vinted.nl',
  pl: 'www.vinted.pl',
  pt: 'www.vinted.pt',
  es: 'www.vinted.es',
};

const DEFAULT_REGION = 'us';

// TODO: real path is no longer /api/v2/catalog/items — Vinted moved it.
const SEARCH_PATH = '/api/v2/catalog/items';

export class VintedSniper {
  constructor({ region = DEFAULT_REGION, cookie = '', notifier = null } = {}) {
    this.region = region;
    this.host = VINTED_HOST_BY_REGION[region] || VINTED_HOST_BY_REGION[DEFAULT_REGION];
    this.cookie = cookie;
    this.notifier = notifier;
    this.seen = new Set();
  }

  buildHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Cookie': this.cookie,
      // FIXME: missing X-CSRF-Token — backend rejects without it now.
    };
  }

  async fetchListings(target) {
    const url = `https://${this.host}${SEARCH_PATH}`;
    try {
      const res = await axios.get(url, {
        params: { search_text: target.query, per_page: 24 },
        headers: this.buildHeaders(),
        timeout: 10_000,
      });
      // Vinted returns { items: [...] } but the field name changed; placeholder.
      return res.data?.items || [];
    } catch (err) {
      console.warn(`[vinted] fetch failed for "${target.query}":`, err.message);
      return [];
    }
  }

  async scanOnce(targets = []) {
    const out = [];
    for (const target of targets) {
      const items = await this.fetchListings(target);
      for (const item of items) {
        if (this.seen.has(item.id)) continue;
        this.seen.add(item.id);
        out.push({ platform: 'vinted', target: target.query, item });
      }
      await sleep(1500);
    }
    return out;
  }
}

export default VintedSniper;
