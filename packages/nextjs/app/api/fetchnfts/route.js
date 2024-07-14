import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { address, chainIds, limit, offset } = await req.json();

    if (!address || !chainIds) {
      return NextResponse.json({ error: 'Address and chainIds are required' }, { status: 400 });
    }

    const url = 'https://api.1inch.dev/nft/v1/byaddress';
    const config = {
      headers: {
        'Authorization': 'Bearer 0k8odnef06Q3JUWMOTiv9RVnRaPDmXBt',
      },
      params: {
        address,
        chainIds: chainIds.join(','), // Convert array to comma-separated string
        limit: limit?.toString() || '10', // Default limit to 10 if not provided
        offset: offset?.toString() || '0', // Default offset to 0 if not provided
      },
    };
    console.log({ config })

    const response = await axios.get(url, config);
    console.log({ response: response.data })
    return NextResponse.json(response?.data || { assets: [] });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}