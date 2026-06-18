import './globals.css';
import 'katex/dist/katex.min.css';
import { Instrument_Sans } from 'next/font/google';

const instrumentSans = Instrument_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-instrument-sans',
});



export const metadata = {
    title: 'Platforma Kursów',
    description: 'Nauka matematyki i innych przedmiotów online',
};

export default function RootLayout({ children }) {
    return (
    <html lang="pl" suppressHydrationWarning>
        <body className={instrumentSans.variable}>
            {children}
        </body>
    </html>
    );
}
