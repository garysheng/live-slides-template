import { NextResponse } from 'next/server';
import os from 'os';

export function GET() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return NextResponse.json({ ip: iface.address });
      }
    }
  }
  return NextResponse.json({ ip: null });
}
