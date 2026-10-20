import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { renderWithProviders, screen, waitFor } from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import CategoryEdit from "./EditCategory";

const categoryId = "1";
const category = {
  id: categoryId,
  name: "Categoria original",
  description: "Descrição original",
  is_active: true,
  deleted_at: null,
  created_at: "2022-09-27T17:10:33+0000",
  updated_at: "2022-09-27T17:10:33+0000",
};

type UpdatedCategory = typeof category;
let updatedCategory: UpdatedCategory | undefined;
let updateRequestCount = 0;

// Simula a consulta e a atualização da categoria usando o identificador da rota.
const server = setupServer(
  rest.get(`${baseUrl}/categories/${categoryId}`, (_, res, ctx) => {
    return res(ctx.delay(100), ctx.status(200), ctx.json({ data: category }));
  }),
  rest.put(`${baseUrl}/categories/${categoryId}`, async (req, res, ctx) => {
    updateRequestCount += 1;
    updatedCategory = (await req.json()) as UpdatedCategory;
    return res(ctx.delay(100), ctx.status(200), ctx.json({ data: category }));
  }),
);

// Monta a edição na rota real para que useParams forneça o ID ao componente.
function renderCategoryEdit() {
  return renderWithProviders(<CategoryEdit />, {
    initialRoute: `/categories/edit/${categoryId}`,
    routePath: "/categories/edit/:id",
  });
}

describe("Edição de categoria", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  beforeEach(() => {
    updatedCategory = undefined;
    updateRequestCount = 0;
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("deve apresentar o carregamento e preencher o formulário com a API", async () => {
    renderCategoryEdit();

    expect(screen.getByText("Carregando categoria...")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Editar Categoria" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue(
      "Categoria original",
    );
    expect(screen.getByRole("textbox", { name: /descrição/i })).toHaveValue(
      "Descrição original",
    );
    expect(screen.getByRole("checkbox", { name: "Ativo" })).toBeChecked();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
      "href",
      "/categories",
    );
  });

  it("deve atualizar os dados e retornar à listagem após o sucesso", async () => {
    const user = userEvent.setup();
    renderCategoryEdit();

    const nameInput = await screen.findByRole("textbox", { name: "Nome" });
    const descriptionInput = screen.getByRole("textbox", {
      name: /descrição/i,
    });

    await user.clear(nameInput);
    await user.type(nameInput, "Categoria atualizada");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "Descrição atualizada");
    await user.click(screen.getByRole("checkbox", { name: "Ativo" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      screen.getByRole("button", { name: "Carregando..." }),
    ).toBeDisabled();
    // Confirma que a proteção de carregamento ignora uma segunda submissão.
    fireEvent.submit(nameInput.closest("form") as HTMLFormElement);
    expect(
      await screen.findByText("Categoria atualizada com sucesso!"),
    ).toBeInTheDocument();
    expect(updatedCategory).toEqual(
      expect.objectContaining({
        id: categoryId,
        name: "Categoria atualizada",
        description: "Descrição atualizada",
        is_active: false,
      }),
    );
    expect(updateRequestCount).toBe(1);
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Editar Categoria" }),
      ).not.toBeInTheDocument();
    });
  });

  it("deve manter o formulário e informar quando a atualização falhar", async () => {
    server.use(
      rest.put(`${baseUrl}/categories/${categoryId}`, (_, res, ctx) => {
        return res(ctx.delay(50), ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderCategoryEdit();

    const nameInput = await screen.findByRole("textbox", { name: "Nome" });
    await user.clear(nameInput);
    await user.type(nameInput, "Alteração com erro");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Erro ao atualizar categoria!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Editar Categoria" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
    });
  });

  it("deve informar quando a categoria não puder ser consultada", async () => {
    server.use(
      rest.get(`${baseUrl}/categories/${categoryId}`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    renderCategoryEdit();

    expect(
      await screen.findByText("Houve um erro ao buscar a categoria."),
    ).toBeInTheDocument();
  });

  it("deve informar o erro quando a rota não possuir um identificador", () => {
    renderWithProviders(<CategoryEdit />, {
      initialRoute: "/categories/edit",
      routePath: "/categories/edit",
    });

    expect(
      screen.getByText("Houve um erro ao buscar a categoria."),
    ).toBeInTheDocument();
  });
});
