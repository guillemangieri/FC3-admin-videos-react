import { Box, Paper, Typography } from "@mui/material";
// Sincroniza o formulário quando os dados da API chegam.
import React, { useEffect, useState } from "react";
// Importa a navegação para retornar à listagem após salvar a edição.
import { useNavigate, useParams } from "react-router-dom";
// Utiliza os endpoints da API em vez do estado local de categorias.
import { Category, useGetCategoryQuery, useUpdateCategoryMutation } from "./categorySlice";
import { CategoryForm } from "./components/CategoryForm";
import { useSnackbar } from "notistack";

const CategoryEdit = () => {
  // Obtém a função de navegação entre as telas da aplicação.
  const navigate = useNavigate();
  const id = useParams().id || "";
  // Busca a categoria pelo ID da rota e acompanha o salvamento no backend.
  const { currentData: category, isFetching, error } = useGetCategoryQuery(
    { id },
    { skip: !id }
  );
  const [updateCategory, { isLoading: isSaving }] = useUpdateCategoryMutation();
  const [categoryState, setCategoryState] = useState<Category | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Preenche o formulário com a resposta assíncrona da categoria selecionada.
  useEffect(() => {
    setCategoryState(category ?? null);
  }, [category, id]);
  
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Preserva os demais campos e só altera uma categoria já carregada.
    setCategoryState((previous) => previous ? ({
      ...previous,
      [name]: value,
    }) : previous);
  };

  const handleToggle = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // Atualiza o status ativo sem substituir os demais dados do formulário.
    setCategoryState((previous) => previous ? ({
      ...previous,
      [name]: checked,
    }) : previous);
  };

  async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Persiste na API e só informa sucesso após a confirmação do backend.
    if (!categoryState || categoryState.id !== id || isSaving || isFetching) return;
    try {
      await updateCategory(categoryState).unwrap();
      enqueueSnackbar("Categoria atualizada com sucesso!", { variant: "success" });
      // Retorna à listagem após a confirmação da API, substituindo a edição no histórico.
      navigate("/categories", { replace: true });
    } catch {
      enqueueSnackbar("Erro ao atualizar categoria!", { variant: "error" });
    }
  };
  
  // Evita apresentar um formulário vazio quando o ID é inválido ou a consulta falha.
  if (!id || error) {
    return <Typography>Houve um erro ao buscar a categoria.</Typography>;
  }

  // Aguarda os dados do registro solicitado antes de permitir a edição.
  if (!category || !categoryState || categoryState.id !== id) {
    return <Typography>Carregando categoria...</Typography>;
  }

  return (
    <Paper>
      <Box p={2}>
        <Box mb={2}>
          <Typography variant="h4">Editar Categoria</Typography>
        </Box>
      </Box>

      <CategoryForm
        category={categoryState}
        // Bloqueia alterações durante consultas e durante o salvamento.
        isdisabled={isFetching || isSaving}
        isLoading={isSaving}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleToggle={handleToggle}
      /> 

    </Paper>
  );
};

export default CategoryEdit;
