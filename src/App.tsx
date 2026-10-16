import { ThemeProvider, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import { Header } from "./components/Header";
import { Layout } from "./components/Layout";
import { appTheme } from "./config/theme";
import { Routes, Route } from "react-router-dom";
import CategoryList from "./features/categories/ListCategory";
import CategoryCreate from "./features/categories/CreateCategory";
import CategoryEdit from "./features/categories/EditCategory";


function App() {
  return (
    <ThemeProvider theme={appTheme}>
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

            <Route path="*" element={
              <Box sx={{ color: "white" }}>
                <Typography variant="h1">404</Typography>
                <Typography variant="h2">Página não encontrada</Typography>
              </Box>
            } />
          </Routes>
        </Layout>
      </Box>
    </ThemeProvider>
  );
}

export default App;
