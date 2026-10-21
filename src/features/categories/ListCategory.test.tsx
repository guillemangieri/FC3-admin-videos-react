import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { renderWithProviders, screen, waitFor } from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import CategoryList from "./ListCategory";

const categoryId = "cbdd550c-ad46-4e50-be8d-a8266aff4162";
let lastRequestedPerPage = "";

// Cria respostas completas dentro da suíte para eliminar a dependência do mock ausente.
function createCategoriesResponse(name: string, currentPage = 1) {
  return {
    data: [
      {
        id: categoryId,
        name,
        description: "Descrição da categoria",
        is_active: true,
        deleted_at: null,
        created_at: "2022-09-27T17:10:33.000000Z",
        updated_at: "2022-09-27T17:10:33.000000Z",
      },
    ],
    links: {
      first: `${baseUrl}/categories?page=1`,
      last: `${baseUrl}/categories?page=2`,
      prev: currentPage === 1 ? "" : `${baseUrl}/categories?page=1`,
      next: currentPage === 2 ? "" : `${baseUrl}/categories?page=2`,
    },
    meta: {
      current_page: currentPage,
      from: currentPage === 1 ? 1 : 11,
      last_page: 2,
      path: `${baseUrl}/categories`,
      per_page: 10,
      to: currentPage === 1 ? 10 : 11,
      total: 11,
    },
  };
}

// Simula listagem, paginação, pesquisa e exclusão nos endpoints reais do slice.
const server = setupServer(
  rest.get(`${baseUrl}/categories`, (req, res, ctx) => {
    const page = req.url.searchParams.get("page");
    const search = req.url.searchParams.get("search");
    lastRequestedPerPage = req.url.searchParams.get("per_page") || "";

    if (page === "2") {
      return res(
        ctx.delay(50),
        ctx.status(200),
        ctx.json(createCategoriesResponse("Categoria da página 2", 2)),
      );
    }

    const name = search || "Categoria de teste";
    return res(
      ctx.delay(50),
      ctx.status(200),
      ctx.json(createCategoriesResponse(name)),
    );
  }),
  rest.delete(`${baseUrl}/categories/${categoryId}`, (_, res, ctx) => {
    return res(ctx.delay(50), ctx.status(204));
  }),
);

describe("Listagem de categorias", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  beforeEach(() => {
    lastRequestedPerPage = "";
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("deve apresentar o carregamento e o acesso ao cadastro", () => {
    renderWithProviders(<CategoryList />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Nova Categoria" }),
    ).toHaveAttribute("href", "/categories/create");
  });

  it("deve apresentar os dados retornados pela API", async () => {
    renderWithProviders(<CategoryList />);

    expect(await screen.findByText("Categoria de teste")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ativa" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Categoria de teste" }),
    ).toHaveAttribute("href", `/categories/edit/${categoryId}`);
  });

  it("deve apresentar uma mensagem quando a listagem falhar", async () => {
    server.use(
      rest.get(`${baseUrl}/categories`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    renderWithProviders(<CategoryList />);

    expect(
      await screen.findByText("Houve um erro ao buscar as categorias"),
    ).toBeInTheDocument();
  });

  it("deve carregar a próxima página", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    await user.click(
      screen.getByRole("button", { name: "Ir para a próxima página" }),
    );

    expect(
      await screen.findByText("Categoria da página 2"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Categoria de teste")).not.toBeInTheDocument();
  });

  it("deve filtrar a listagem pelo texto pesquisado", async () => {
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Documentário" } });

    expect(await screen.findByText("Documentário")).toBeInTheDocument();
  });

  it("deve remover o filtro quando a pesquisa for apagada", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Suspense" } });
    expect(await screen.findByText("Suspense")).toBeInTheDocument();

    await user.clear(searchInput);
    expect(await screen.findByText("Categoria de teste")).toBeInTheDocument();
  });

  it("deve alterar a quantidade de linhas por página", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    await user.click(
      screen.getByRole("button", { name: "Linhas por página: 10" }),
    );
    await user.click(screen.getByRole("option", { name: "25" }));

    await waitFor(() => {
      expect(lastRequestedPerPage).toBe("25");
    });
    expect(
      screen.getByRole("button", { name: "Linhas por página: 25" }),
    ).toBeInTheDocument();
  });

  it("deve informar quando a exclusão for concluída", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    await user.click(screen.getByRole("button", { name: "Excluir categoria" }));

    expect(
      await screen.findByText("Categoria deletada com sucesso!"),
    ).toBeInTheDocument();
  });

  it("deve informar quando a exclusão falhar", async () => {
    server.use(
      rest.delete(`${baseUrl}/categories/${categoryId}`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<CategoryList />);

    await screen.findByText("Categoria de teste");
    await user.click(screen.getByRole("button", { name: "Excluir categoria" }));

    expect(
      await screen.findByText("Erro ao deletar categoria!"),
    ).toBeInTheDocument();
  });
});
