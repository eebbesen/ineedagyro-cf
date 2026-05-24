# ineedagyro-cf

Gyros near you!

https://www.ineedagyro.com

For other foods, add a `term` parameter e.g., https://ineedagyro.com/?term=cheese%20steak

## How?

Uses the browser's `navigator.geolocation.getCurrentPosition()` to get your location, then calls
[Yelp's Fusion API](https://www.yelp.com/developers/documentation/v3/business_search) via a
[Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/) that keeps the API
key server-side.

## Run locally

1. Get an API key from [Yelp](https://www.yelp.com/developers/v3/manage_app)
1. Set it in your environment:

```bash
export YELP_API_KEY=your_key
```

3. Start the local dev server:

```bash
npm install
npm run dev
```

Then browse to http://localhost:8788.

## Test

```bash
npm test
```

To generate a human-readable test result report:

```bash
npm run test_report
```

Then open `mochawesome-report/mochawesome.html`.

To generate a test coverage report:

```bash
npm run test_coverage_html
```

Then open `coverage/index.html`.

## Helpy things

### cURL

Call the Yelp endpoint directly:

```bash
export YELP_API_KEY=<your_key>
curl -H "Authorization: Bearer $YELP_API_KEY" \
  "https://api.yelp.com/v3/businesses/search?latitude=44.938&longitude=-93.169&term=gyro&sort_by=distance"
```

### Chrome location permissions reset

https://support.google.com/chrome/answer/114662?co=GENIE.Platform%3DDesktop&hl=en
