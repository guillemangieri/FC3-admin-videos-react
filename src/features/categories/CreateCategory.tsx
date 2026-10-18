import { Box, Paper, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Category } from "./categorySlice";
import { CategoryForm } from "./components/CategoryForm";
import { useCreateCategoryMutation } from "./categorySlice";
import { useSnackbar } from "notistack";
// Importa o recurso de navegação para retornar à listagem após o cadastro.
import { useNavigate } from "react-router-dom";
const CategoryCreate = () => {
  // Obtém a função que permite navegar entre as rotas da aplicação.
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [createCategory, status] = useCreateCategoryMutation();
  // Mantém o formulário habilitado: após o sucesso, a tela será substituída pela listagem.
  const isdisabled = false;
  const [categoryState, setCategoryState] = useState<Category>({
    id: "",
    name: "",
    description: "",
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  })
  
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryState({
      ...categoryState,
      [name]: value,
    });
  };

  const handleToggle = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategoryState({
      ...categoryState,
      [name]: checked,
    });
  };

  async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    await createCategory(categoryState);
    setIsLoading(false);
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status.isSuccess) {
      enqueueSnackbar("Categoria criada com sucesso!", { variant: "success" });
      // Retorna à listagem somente após o sucesso, substituindo o cadastro no histórico.
      navigate("/categories", { replace: true });
    }
    if (status.error) {
      enqueueSnackbar("Erro ao criar categoria!", { variant: "error" });
    }
  // Inclui a função de navegação nas dependências utilizadas pelo efeito.
  }, [enqueueSnackbar, status.error, status.isSuccess, navigate]);


  return (
    <Paper>
      <Box p={2}>
        <Box mb={2}>
          <Typography variant="h4">Criar Categoria</Typography>
        </Box>
      </Box>

      <CategoryForm
        category={categoryState}
        isdisabled={isdisabled}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleToggle={handleToggle}
      />
    </Paper>
  );
};

export default CategoryCreate;
