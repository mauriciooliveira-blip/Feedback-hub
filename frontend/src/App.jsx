import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { pagesConfig } from "./pages.config";

export default function App() {
  const { Pages, Layout, mainPage } = pagesConfig;
  const entries = Object.entries(Pages);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page without layout */}
        <Route path="/login" element={<Pages.Login />} />
        
        {/* All other pages with layout */}
        {entries.map(([pageName, PageComponent]) => {
          if (pageName === "Login") return null;
          return (
            <Route
              key={pageName}
              path={createPageUrl(pageName)}
              element={
                <Layout currentPageName={pageName}>
                  <PageComponent />
                </Layout>
              }
            />
          );
        })}
        <Route
          path="*"
          element={<Navigate to={createPageUrl(mainPage)} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
