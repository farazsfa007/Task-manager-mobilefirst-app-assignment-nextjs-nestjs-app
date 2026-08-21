import './globals.css';
import { AuthProvider } from './providers/AuthProvider';

export const metadata = {
  title: 'Task Manager',
  description: 'Simple private task management application',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
