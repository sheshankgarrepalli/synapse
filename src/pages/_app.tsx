import '@/styles/globals.css';
import '@/styles/animations.css';
import '@/styles/shepherd-custom.css';
import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { api } from '@/utils/api';
import { ToastProvider } from '@/components/ui/Toast';

function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <Component {...pageProps} />
      <ToastProvider />
    </ClerkProvider>
  );
}

export default api.withTRPC(App);
