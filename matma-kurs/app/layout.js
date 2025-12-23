import './globals.css';

export const metadata = {
    title: 'Platforma Kursów',
    description: 'Nauka matematyki i innych przedmiotów online',
};

export default function RootLayout({ children }) {
    return (
    <html lang="pl">
        <body>
            {children}
        </body>
    </html>
    );
}