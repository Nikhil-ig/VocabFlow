import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import AppInitializer from '@/components/AppInitializer';

import { Inter, Outfit, Roboto, Comic_Neue } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const roboto = Roboto({ weight: ['400', '500', '700', '900'], subsets: ['latin'], variable: '--font-roboto' });
const comicNeue = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-comic' });

export const metadata: Metadata = {
    title: 'VocabFlow - AI Vocabulary Learning',
    description: 'Master new vocabulary with AI-powered spaced repetition',
};

export const viewport: Viewport = {
    themeColor: '#ffffff',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`antialiased ${inter.variable} ${outfit.variable} ${roboto.variable} ${comicNeue.variable} font-inter bg-slate-50 text-slate-900`}>
                <Providers>
                    <AppInitializer />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
