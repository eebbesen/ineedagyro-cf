import { expect } from 'chai';
import { onRequestGet } from '../../functions/version.js';

describe('version', () => {
  it('returns CF_PAGES_COMMIT_SHA when set', async () => {
    const res = await onRequestGet({ env: { CF_PAGES_COMMIT_SHA: 'abc123def456' } });
    expect(res.status).to.equal(200);
    const json = await res.json();
    expect(json.version).to.equal('abc123def456');
  });

  it('returns "unknown" when CF_PAGES_COMMIT_SHA is not set', async () => {
    const res = await onRequestGet({ env: {} });
    expect(res.status).to.equal(200);
    const json = await res.json();
    expect(json.version).to.equal('unknown');
  });
});
