import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SocketContextProvider from "./context/SocketContext.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* <StrictMode> */}
    {/* <QueryClientProvider client={queryClient}> */}
    <UserContextProvider>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </UserContextProvider>
    {/* </QueryClientProvider> */}
    {/* </StrictMode> */}
  </BrowserRouter>
);
