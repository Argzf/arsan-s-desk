import './globals.css';

export const metadata = {
  title: "Arsan's Desk",
  description: 'Submit your ideas, complaints, and suggestions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
