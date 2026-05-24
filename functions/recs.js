export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const term = searchParams.get('term') ?? 'gyro';

  if (!lat || !lng) {
    return Response.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const yelpParams = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    term,
    sort_by: 'distance',
  });

  try {
    const response = await fetch(
      `https://api.yelp.com/v3/businesses/search?${yelpParams}`,
      { headers: { Authorization: `Bearer ${env.YELP_API_KEY}` } },
    );
    const data = await response.json();
    if (!response.ok) {
      console.log('Yelp API error', response.status, data);
      return Response.json({ error: 'Yelp API error', detail: data }, { status: response.status });
    }
    return Response.json({ locs: data.businesses });
  } catch (err) {
    console.log(err);
    return Response.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}
