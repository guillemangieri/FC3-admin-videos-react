import { ThemeProvider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { Layout } from "./components/Layout";
import { appTheme } from "./config/theme";
import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
//import { ProtectedRoute } from "./components/ProtectedRoute";
import GenreList from "./features/genres/GenreList";
import GenreCreate from "./features/genres/GenreCreate";
import GenreEdit from "./features/genres/GenreEdit";
import CategoryList from "./features/categories/ListCategory";
import CategoryCreate from "./features/categories/CreateCategory";
import CategoryEdit from "./features/categories/EditCategory";
import { ListCastmembers } from "./features/cast/ListCastmembers";
import { CreateCastMember } from "./features/cast/CreateCastMembers";
import { EditCastMember } from "./features/cast/EditCastMember";

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <SnackbarProvider 
        autoHideDuration={2000}
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        >
        <Box
          component="main"
          sx={{
            height: "100vh",
            backgroundColor: (theme) => theme.palette.grey[500],
          }}
        >
          <Header />
          <Layout>
            <h1>Inicio</h1>
            <Routes>
              <Route path="/" element={<CategoryList />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/create" element={<CategoryCreate />} />
              <Route path="/categories/edit/:id" element={<CategoryEdit />} />

              <Route path="/cast-members" element={<ListCastmembers />} />
              <Route path="/cast-members/create" element={<CreateCastMember />} />
              <Route path="/cast-members/edit/:id" element={<EditCastMember />} />

              {/* Genre */}
              {/*}
              <Route path="/genres" element={<ProtectedRoute><GenreList /></ProtectedRoute>}/>
              <Route path="/genres/create" element={<ProtectedRoute><GenreCreate /></ProtectedRoute>} />
              <Route path="/genres/edit/:id" element={<ProtectedRoute><GenreEdit /></ProtectedRoute>} />
              */}
              <Route path="/genres" element={<GenreList />} />
              <Route path="/genres/create" element={<GenreCreate />} />
              <Route path="/genres/edit/:id" element={<GenreEdit />} />

              <Route
                path="*"
                element={
                  <Box sx={{ color: "white" }}>
                    <Typography variant="h1">404</Typography>
                    <Typography variant="h2">Página não encontrada</Typography>
                  </Box>
                }
              />
            </Routes>
          </Layout>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
