// Shared multi-platform workspace coordinator.
// Holds a watchlist of cross-platform targets and dispatches them to the
// per-platform snipers. Each sniper is responsible for its own poll loop.

import { VintedSniper } from '../vinted-sniper.js';
import { WallapopSniper } from '../wallapop-sniper.js';
import { MercariSniper } from '../mercari-sniper.js';
import { DiscordNotifier } from './notifier.js';

export class SharedWorkspace {
  constructor({ settings = {}, notifier = null } = {}) {
    this.settings = settings;
    this.notifier = notifier || new DiscordNotifier({ webhooks: settings.webhooks });
    this.snipers = {
      vinted: new VintedSniper({
        region: settings.vintedRegion,
        cookie: settings.vintedCookie,
        notifier: this.notifier,
      }),
      wallapop: new WallapopSniper({
        lat: settings.lat,
        lng: settings.lng,
        notifier: this.notifier,
      }),
      mercari: new MercariSniper({
        token: settings.mercariToken,
        notifier: this.notifier,
      }),
    };
    this.targets = [];
  }

  setTargets(targets = []) {
    this.targets = targets;
  }

  async scanAll() {
    const results = [];
    for (const [platform, sniper] of Object.entries(this.snipers)) {
      const platformTargets = this.targets.filter(
        (t) => !t.platforms || t.platforms.includes(platform),
      );
      const hits = await sniper.scanOnce(platformTargets);
      results.push(...hits);
    }
    return results;
  }
}

export default SharedWorkspace;
