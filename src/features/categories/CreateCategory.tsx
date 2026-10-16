import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { Category } from "./categorySlice";
import { CategoryForm } from "./components/CategoryForm";
import { useAppDispatch } from "../../app/hooks";
import { createCategory } from "./categorySlice";

const CategoryCreate = () => {
  
  const [isdisabled, setIsdisabled] = useState(false);
  const [categoryState, setCategoryState] = useState<Category>({
    id: "",
    name: "",
    description: "",
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  })
  const dispatch = useAppDispatch();
  
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
    dispatch(createCategory(categoryState));

  };

  const [isLoading, setIsLoading] = useState(false);

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
