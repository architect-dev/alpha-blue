import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = "https://g1cvuapee3.execute-api.us-east-1.amazonaws.com/api/v1/order?cache=" + Date.now();

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    // Create a NextResponse object with the data
    const nextResponse = NextResponse.json(data);
    // Set cache-control headers to ensure the response is not cached
    nextResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return nextResponse;
  } catch (error) {
    console.error("Error fetching data", error);
    // Create an error response with cache-control headers
    const errorResponse = NextResponse.json({ message: "Failed to fetch trades" }, { status: 500 });
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return errorResponse;
  }
}