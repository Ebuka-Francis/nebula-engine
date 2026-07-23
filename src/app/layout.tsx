import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
// import TopNav from '@/components/top-nav/TopNav';
import Providers from '@/components/provider/Provider';
import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export const metadata: Metadata = {
   title: 'Nebula-Engine',
   description: 'The all-in-one Web3 platform for poker tournaments, prediction markets and bounty competitions.',
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
            <Providers>
               {/* <TopNav /> */}
               {children}
            </Providers>
         </body>
      </html>
   );
}
