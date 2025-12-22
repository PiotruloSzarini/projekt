import "./globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="pl">
      <body>
        <header>MENU</header>
        {children}
        <footer>STOPKA</footer>
      </body>
    </html>
  )
}

