import { expect } from 'chai';
import { onRequestGet } from '../../functions/recs.js';

const mockEnv = { YELP_API_KEY: 'test-key' };

function makeRequest(params = {}) {
  const url = new URL('https://ineedagyro.com/recs');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

function mockFetch(businesses = []) {
  return async () =>
    new Response(JSON.stringify({ businesses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
}

describe('recs', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('missing parameters', () => {
    it('returns 400 when lat is missing', async () => {
      const res = await onRequestGet({ request: makeRequest({ lng: '-93.169' }), env: mockEnv });
      expect(res.status).to.equal(400);
      expect((await res.json()).error).to.equal('lat and lng are required');
    });

    it('returns 400 when lng is missing', async () => {
      const res = await onRequestGet({ request: makeRequest({ lat: '44.938' }), env: mockEnv });
      expect(res.status).to.equal(400);
      expect((await res.json()).error).to.equal('lat and lng are required');
    });

    it('returns 400 when both lat and lng are missing', async () => {
      const res = await onRequestGet({ request: makeRequest(), env: mockEnv });
      expect(res.status).to.equal(400);
    });
  });

  describe('successful Yelp response', () => {
    it('returns locs from Yelp', async () => {
      const businesses = [{ name: 'Gyro Hero', url: 'https://gyro.hero' }];
      globalThis.fetch = mockFetch(businesses);

      const res = await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(res.status).to.equal(200);
      expect((await res.json()).locs).to.deep.equal(businesses);
    });

    it('uses default term "gyro" when not provided', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => { capturedUrl = url; return mockFetch()(); };

      await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(capturedUrl).to.include('term=gyro');
    });

    it('uses provided term when given', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => { capturedUrl = url; return mockFetch()(); };

      await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169', term: 'falafel' }), env: mockEnv });
      expect(capturedUrl).to.include('term=falafel');
    });

    it('sends Authorization header with API key', async () => {
      let capturedOptions;
      globalThis.fetch = async (url, options) => { capturedOptions = options; return mockFetch()(); };

      await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(capturedOptions.headers.Authorization).to.equal('Bearer test-key');
    });

    it('passes lat, lng, and sort_by=distance to Yelp', async () => {
      let capturedUrl;
      globalThis.fetch = async (url) => { capturedUrl = url; return mockFetch()(); };

      await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(capturedUrl).to.include('latitude=44.938');
      expect(capturedUrl).to.include('longitude=-93.169');
      expect(capturedUrl).to.include('sort_by=distance');
    });
  });

  describe('Yelp API error response', () => {
    it('forwards the Yelp error status and body', async () => {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ error: { code: 'TOKEN_INVALID' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });

      const res = await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(res.status).to.equal(401);
      const json = await res.json();
      expect(json.error).to.equal('Yelp API error');
      expect(json.detail.error.code).to.equal('TOKEN_INVALID');
    });
  });

  describe('Yelp fetch failure', () => {
    it('returns 500 when fetch throws', async () => {
      globalThis.fetch = async () => { throw new Error('network error'); };

      const res = await onRequestGet({ request: makeRequest({ lat: '44.938', lng: '-93.169' }), env: mockEnv });
      expect(res.status).to.equal(500);
      expect((await res.json()).error).to.equal('Failed to fetch results');
    });
  });
});
