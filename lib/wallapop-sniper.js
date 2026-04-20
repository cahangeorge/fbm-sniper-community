// Wallapop sniper — WIP. Spain-focused, in theory worldwide.
//
// Wallapop changed their JSON-LD embedding around the same time Vinted did.
// Selectors below haven't been refreshed. Listings come back empty.

import axios from 'axios';
import { setTimeout as sleep } from 'node:timers/promises';

const WALLAPOP_BASE = 'https://api.wallapop.com/api/v3';

// TODO: real endpoint is /general/search but the params shape changed.
const SEARCH_PATH = '/general/search';

const DEFAULT_FILTERS = {
  distance: 50_000,
  order_by: 'newest',
  step: 30,
};

export class WallapopSniper {
  constructor({ lat, lng, notifier = null } = {}) {
    this.lat = lat ?? 40.4168;
    this.lng = lng ?? -3.7038;
    this.notifier = notifier;
    this.seen = new Set();
  }

  buildParams(target) {
    return {
      keywords: target.query,
      latitude: this.lat,
      longitude: this.lng,
      ...DEFAULT_FILTERS,
    };
  }

  async fetchListings(target) {
    try {
      const res = await axios.get(`${WALLAPOP_BASE}${SEARCH_PATH}`, {
        params: this.buildParams(target),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          // FIXME: device-id header is required now; not generated.
        },
        timeout: 10_000,
      });
      // Wallapop wraps results in search_objects[]; field renamed mid-April.
      return res.data?.search_objects || [];
    } catch (err) {
      console.warn(`[wallapop] fetch failed for "${target.query}":`, err.message);
      return [];
    }
  }

  async scanOnce(targets = []) {
    const out = [];
    for (const target of targets) {
      const items = await this.fetchListings(target);
      for (const item of items) {
        const id = item?.id || item?.item_uuid;
        if (!id || this.seen.has(id)) continue;
        this.seen.add(id);
        out.push({ platform: 'wallapop', target: target.query, item });
      }
      await sleep(1500);
    }
    return out;
  }
}

export default WallapopSniper;
