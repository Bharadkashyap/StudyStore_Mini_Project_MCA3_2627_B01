import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";

import "./index.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <BrowserRouter>

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 2500,

          style: {
            background: "#FFFFFF",
            color: "#2F3E46",
            border: "1px solid #8FBC8F",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(143,188,143,.20)"
          },

          success: {
            iconTheme: {
              primary: "#8FBC8F",
              secondary: "#FFFFFF"
            }
          },

          error: {
            iconTheme: {
              primary: "#ff4d4f",
              secondary: "#FFFFFF"
            }
          }
        }}
      />

      <App />

    </BrowserRouter>

  </React.StrictMode>
);