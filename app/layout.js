import './globals.css';
import { ThemeProvider } from '@/lib/ThemeContext';

export const metadata = {
  title: "Arsan's Desk",
  description: 'Submit your ideas, complaints, and suggestions.',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
