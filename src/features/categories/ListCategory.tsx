import { Box, Button, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { deleteCategory, selectCategories } from "./categorySlice";
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
  GridToolbar,
  ptBR,
} from "@mui/x-data-grid";


const CategoryList = () => {
  const categories = useAppSelector(selectCategories);
  const dispatch = useAppDispatch();
  
   const rows: GridRowsProp = categories.map((category) => ({
     id: category.id,
     name: category.name,
     description: category.description,
     is_active: category.is_active,
     created_at: new Date(category.created_at).toLocaleDateString("pt-BR"),
    }));
    
    const componentsProps = {
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          };

    const columns: GridColDef[] = [
      {
        field: "name",
        headerName: "Nome",
        flex: 1,
        renderCell: renderNameCell,
      },
       {
         field: "is_active",
         headerName: "Ativo",
         flex: 1,
         type: "boolean",
      renderCell: renderIsActiveCell,
    },
    {
      field: "created_at",
      headerName: "Criado em",
      flex: 1,
      type: "dateTime",
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      renderCell: renderActionsCell,
    },
  ];

  function renderNameCell(rowData: GridRenderCellParams) {
    return (
      <Link 
        style={{ textDecoration: "none", color: "inherit" }}
        to={`/categories/edit/${rowData.id}`}
      >
        <Typography color="primary">
          {rowData.value}
        </Typography>
      </Link>
    );
  }
  
  function handleDeleteCategory(id:string){
    dispatch(deleteCategory({id}));
  }

  function renderActionsCell(rowData: GridRenderCellParams) {

    return (
      <IconButton 
        color="secondary"
        onClick={() => handleDeleteCategory(String(rowData.id))}
        aria-label="delete"
        >
        <DeleteIcon />
      </IconButton>
    );
  }
  
  function renderIsActiveCell(rowData: GridRenderCellParams) {
    return (
      <Typography color={rowData.value ? "primary" : "secondary"}>
        {rowData.value ? "Ativo" : "Inativo"}
      </Typography>
    );
  }
  
  return (
    <Box maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
      <Box sx={{ display: "flex", height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnFilter={true}
          disableColumnSelector={true}
          disableDensitySelector={true}
          componentsProps={componentsProps}
          components={{ Toolbar: GridToolbar }}
          rowsPerPageOptions={[5, 10, 20, 50, 100]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </Box>
      <Typography variant="h3">
        <hr />
        Tela de listagem das categorias
      </Typography>
    </Box>
  );
};

export default CategoryList;
