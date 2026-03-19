import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';
import { ethers } from 'ethers';

export async function POST(req: NextRequest) {
   try {
      const { address, signature, message } = await req.json();

      if (!address || !signature || !message) {
         return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      }

      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
         return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 },
         );
      }

      const token = await admin.auth().createCustomToken(address.toLowerCase());

      return NextResponse.json({ token });
   } catch (err) {
      console.error('Wallet auth error:', err);
      return NextResponse.json(
         { error: 'Authentication failed' },
         { status: 500 },
      );
   }
}
