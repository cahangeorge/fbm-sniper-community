// Discord webhook notifier for multi-platform deal alerts.
// Routes alerts to All / Buy Now / Maybe webhooks based on grading bucket.

import axios from 'axios';

const DEFAULT_TIMEOUT_MS = 5_000;

export class DiscordNotifier {
  constructor({ webhooks = {} } = {}) {
    this.webhooks = {
      all: webhooks.all || '',
      buy_now: webhooks.buy_now || '',
      maybe: webhooks.maybe || '',
    };
  }

  pickWebhook(bucket) {
    if (bucket === 'buy_now' && this.webhooks.buy_now) return this.webhooks.buy_now;
    if (bucket === 'maybe' && this.webhooks.maybe) return this.webhooks.maybe;
    return this.webhooks.all;
  }

  buildEmbed(deal) {
    return {
      title: deal.title || 'Untitled listing',
      url: deal.url,
      description: deal.description?.slice(0, 200) || '',
      fields: [
        { name: 'Platform', value: deal.platform || 'unknown', inline: true },
        { name: 'Price', value: deal.price ?? '—', inline: true },
        { name: 'Bucket', value: deal.bucket || 'maybe', inline: true },
      ],
    };
  }

  async send(deal) {
    const url = this.pickWebhook(deal.bucket || 'maybe');
    if (!url) return { skipped: true, reason: 'no webhook configured' };
    try {
      await axios.post(
        url,
        { embeds: [this.buildEmbed(deal)] },
        { timeout: DEFAULT_TIMEOUT_MS },
      );
      return { sent: true };
    } catch (err) {
      return { sent: false, error: err.message };
    }
  }
}

export default DiscordNotifier;
