import fs from 'fs';

async function main() {
  console.log('Testing connection to RiftScribe API...');
  try {
    const res = await fetch('https://riftscribe.gg/api/cards?limit=10&offset=0');
    console.log('RiftScribe API status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Fetched sample cards:', data.length);
    }
  } catch (err) {
    console.warn('Cannot fetch from riftscribe directly:', err.message);
  }
}

main();
