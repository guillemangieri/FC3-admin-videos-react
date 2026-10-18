import { Box, Button, Typography } from "@mui/material";
import {
  GridFilterModel
} from "@mui/x-data-grid";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDeleteCategoryMutation, useGetCategoriesQuery } from "./categorySlice";
import { CategoriesTable } from "./components/CategoryTable";

const CategoryList = () => {
  const rowsPerPage = [10, 25, 50, 100];
  const [options, setOptions] = useState({ perPage: 10, search: "", page: 1 });

  const {data, isFetching, error} = useGetCategoriesQuery(options);
  const [deleteCategoryMutation, deleteCategoryStatus] = useDeleteCategoryMutation();

  const { enqueueSnackbar } = useSnackbar();

  function handleOnPageChange(page: number) {
    setOptions((previous) => ({ ...previous, page: page + 1 }));
  }

  function handleOnPageSizeChange(perPage: number) {
    setOptions((previous) => ({ ...previous, perPage, page: 1 }));
  }

  function handleFilterChange(filterModel: GridFilterModel) {
   if (!filterModel.quickFilterValues?.length) {
      return setOptions((previous) => ({ ...previous, search: "", page: 1 }));
    }

    const search = filterModel.quickFilterValues.join("");
    setOptions((previous) => ({ ...previous, search, page: 1 }));
  }

  //--?? handleDelete???
  async function handleDeleteCategory(id:string){
    await deleteCategoryMutation({id});
  }

  useEffect(() => {
    if (deleteCategoryStatus.isSuccess) {
      enqueueSnackbar("Categoria deletada com sucesso!", { variant: "success" });
    }
    if (deleteCategoryStatus.isError) {
      enqueueSnackbar("Erro ao deletar categoria!", { variant: "error" });
    }
  }, [deleteCategoryStatus, enqueueSnackbar]);

  if (error) {
    return <Typography>Houve um erro ao buscar as categorias</Typography>;
  }

  return (
    <Box maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Quick filter and other toolbar components can be added here if needed */  }
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/categories/create"
          style={{ marginBottom: "1rem" }}
          sx={{ borderRadius: "8px" }}
        >
          Nova Categoria
        </Button>
      </Box>
      {/* DataGrid Section */}

      <CategoriesTable
        data={data}
        page={options.page - 1}
        perPage={options.perPage}
        isFetching={isFetching}
        rowsPerPage={rowsPerPage}
        handleDelete={handleDeleteCategory}
        handleOnPageChange={handleOnPageChange}
        handleOnPageSizeChange={handleOnPageSizeChange}
        handleFilterChange={handleFilterChange}
      />
      <Typography variant="h3">
        <hr />
        Tela de listagem das categorias
      </Typography>
    </Box>
  );
};

export default CategoryList;
