import React, { PropsWithChildren } from "react";
import { render , RenderOptions } from "@testing-library/react";
import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import { AppStore, RootState, setupStore } from "../app/store";
import { SnackbarProvider } from "notistack";
import { MemoryRouter, Route, Routes } from "react-router-dom";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
  initialRoute?: string;
  routePath?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    store = setupStore(),
    initialRoute = "/",
    routePath,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[initialRoute]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <SnackbarProvider>
            {routePath ? (
              <Routes>
                <Route path={routePath} element={<>{children}</>} />
                <Route path="*" element={null} />
              </Routes>
            ) : (
              children
            )}
          </SnackbarProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

export * from "@testing-library/react";
