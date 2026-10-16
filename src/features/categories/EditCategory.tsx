import { Box, Paper, Typography } from "@mui/material";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { Category, selectCategoryById, updateCategory } from "./categorySlice";
import { CategoryForm } from "./components/CategoryForm";

const CategoryEdit = () => {
  const id = useParams().id || "";
  const [isdisabled, setIsdisabled] = useState(false);
  const category = useAppSelector((state) => selectCategoryById(state,id));
  const [categoryState, setCategoryState] = useState<Category>(category);
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
    dispatch(updateCategory(categoryState));

  };
  
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Paper>
      <Box p={2}>
        <Box mb={2}>
          <Typography variant="h4">Editar Categoria</Typography>
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

export default CategoryEdit;