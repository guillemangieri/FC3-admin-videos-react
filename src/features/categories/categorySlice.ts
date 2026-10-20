import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import type { CategoryParams, Result, Results } from "../../types/Category";
import type { RootState } from "../../app/store";

const endpointUrl = "/categories";

function parseQueryParams(params: CategoryParams) {
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.append("page", params.page.toString());
  }

  if (params.perPage) {
    // Envia o tamanho da página com o nome esperado pelo backend.
    queryParams.append("per_page", params.perPage.toString());
  }

  if (params.search) {
    queryParams.append("search", params.search);
  }

  if (params.isActive !== undefined) {
    queryParams.append("isActive", params.isActive.toString());
  }

  return `?${queryParams.toString()}`;
}

function getCategoriesQuery(params: CategoryParams) {
  const queryParams = {page: params.page, perPage: params.perPage, search: params.search, isActive: params.isActive};
  return {
    url: `${endpointUrl}${parseQueryParams(queryParams)}`,
    method: "GET",
  };
}

function deleteCategoryMutation(category: Category) {
  return {
    url: `${endpointUrl}/${category.id}`,
    method: "DELETE",
  };
};

function createCategoryMutation(category: Category) {
  return { url: endpointUrl, method: "POST", body: category };
}

function updateCategoryMutation(category: Category) {
  return {
    url: `${endpointUrl}/${category.id}`,
    method: "PUT",
    body: category,
  };
}

function getCategory({ id }: { id: string }) {
  return `${endpointUrl}/${id}`;
}

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: ({ query, mutation }) => ({
    getCategories: query<Results, CategoryParams>({
      query: getCategoriesQuery,
      providesTags: ["Categories"],
    }),
    deleteCategory: mutation<Result, { id: string }>({
      query: deleteCategoryMutation,
      invalidatesTags: ["Categories"],
    }),
    createCategory: mutation<Result, Category>({
      query: createCategoryMutation,
      invalidatesTags: ["Categories"],
    }),
    updateCategory: mutation<Result, Category>({
      query: updateCategoryMutation,
      invalidatesTags: ["Categories"],
    }),
    getCategory: query<Category, { id: string }>({
      query: getCategory,
      // Extrai a categoria do campo data retornado pelo backend.
      transformResponse: (response: { data: Category }) => response.data,
      providesTags: ["Categories"],
    }),
  }),
});

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

export default categoriesSlice.reducer;
export const { createCategory, updateCategory, deleteCategory } = categoriesSlice.actions;

export const { 
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoryQuery,
} = categoriesApiSlice;
