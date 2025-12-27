import './globals.css';

export const metadata = {
    title: 'Platforma Kursów',
    description: 'Nauka matematyki i innych przedmiotów online',
};

export default function RootLayout({ children }) {
    return (
    <html>
        <body>
            {children}
        </body>
    </html>
    );
}