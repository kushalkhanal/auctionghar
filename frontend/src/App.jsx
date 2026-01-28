import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import AppRouter from "./routers/AppRouter";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Replace with your actual reCAPTCHA v3 site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

function App() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <ToastProvider>
        <AuthProvider>
          <PermissionProvider>
            <SocketProvider>
              <WatchlistProvider> {/* Added WatchlistProvider wrapper */}
                <BrowserRouter>
                  <AppRouter />
                </BrowserRouter>
              </WatchlistProvider>
            </SocketProvider>
          </PermissionProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;