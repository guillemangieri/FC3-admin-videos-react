import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  description: null | string;
}
const category: Category = {
  id: "93seter8-1173-4730-a960-a7ed500923a4",
  name: "Aventura",
  description: "Lorem ipsum dolor sit amet consectetur adipisicing",
  is_active: true,
  created_at: "2026-06-14T14:05:00+0000",
  updated_at: "2026-10-14T14:05:00+0000",
  deleted_at: null,
}

export const initialState = [
  category,
  { ...category, id: "94seter8-1173-4730-a960-a7ed500923a4", name: "Terror" },
  { ...category, id: "95seter8-1173-4730-a960-a7ed500923a4", name: "Suspense" },
  { ...category, id: "96seter8-1173-4730-a960-a7ed500923a4", name: "Ação" }
];

const categoriesSlice = createSlice({
  name: "categories",
  initialState: initialState,
  reducers: {
    createCategory: (state, action) => {
      state.push(action.payload);
    },
    updateCategory: (state, action) => {
      const index = state.findIndex((category) => category.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteCategory: (state, action) => {
      const index = state.findIndex((category) => category.id === action.payload.id);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
  }
});

export const selectCategories = (state: RootState) => state.categories;
export const selectCategoryById = (state: RootState, id: string) => {
  const category = state.categories.find(category => category.id === id);
  return category || {
    id: "",
    name: "",
    description: null,
    is_active: false,
    created_at: "",
    updated_at: "",
    deleted_at: null,
  };
};

export const { createCategory, updateCategory, deleteCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;