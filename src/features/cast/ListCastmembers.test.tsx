import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { renderWithProviders, screen, waitFor } from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import { ListCastmembers } from "./ListCastmembers";

// Cria respostas completas da API dentro da própria suíte para que os testes
// não dependam de um módulo de mocks inexistente no projeto.
const castMemberId = "f55fca48-d422-48bf-b212-956215eddcaf";
let lastRequestedPerPage = "";

function createCastMembersResponse(name: string, currentPage = 1) {
  return {
    data: [
      {
        id: castMemberId,
        name,
        type: 1,
        deleted_at: null,
        created_at: "2022-09-27T17:10:33.000000Z",
        updated_at: "2022-09-27T17:10:33.000000Z",
      },
    ],
    links: {
      first: `${baseUrl}/cast_members?page=1`,
      last: `${baseUrl}/cast_members?page=2`,
      prev: currentPage === 1 ? "" : `${baseUrl}/cast_members?page=1`,
      next: currentPage === 2 ? "" : `${baseUrl}/cast_members?page=2`,
    },
    meta: {
      currentPage,
      from: currentPage === 1 ? 1 : 11,
      lastPage: 2,
      path: `${baseUrl}/cast_members`,
      perPage: 10,
      to: currentPage === 1 ? 10 : 11,
      total: 11,
    },
  };
}

// Simula listagem, paginação, filtro e exclusão usando os endpoints do slice.
const server = setupServer(
  rest.get(`${baseUrl}/cast_members`, (req, res, ctx) => {
    const page = req.url.searchParams.get("page");
    const search = req.url.searchParams.get("search");
    lastRequestedPerPage = req.url.searchParams.get("per_page") || "";

    if (page === "2") {
      return res(
        ctx.delay(50),
        ctx.status(200),
        ctx.json(createCastMembersResponse("Integrante da página 2", 2)),
      );
    }

    const name = search || "Integrante de teste";
    return res(
      ctx.delay(50),
      ctx.status(200),
      ctx.json(createCastMembersResponse(name)),
    );
  }),
  rest.delete(`${baseUrl}/cast_members/${castMemberId}`, (_, res, ctx) => {
    return res(ctx.delay(50), ctx.status(204));
  }),
);

describe("Listagem de integrantes do elenco", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  beforeEach(() => {
    lastRequestedPerPage = "";
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("deve apresentar o carregamento e o acesso ao cadastro", () => {
    renderWithProviders(<ListCastmembers />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Novo Membro do Elenco" }),
    ).toHaveAttribute("href", "/cast-members/create");
  });

  it("deve apresentar os dados retornados pela API", async () => {
    renderWithProviders(<ListCastmembers />);

    expect(await screen.findByText("Integrante de teste")).toBeInTheDocument();
    expect(screen.getByText("Diretor")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Integrante de teste" }),
    ).toHaveAttribute("href", `/cast-members/edit/${castMemberId}`);
  });

  it("deve apresentar uma mensagem quando a listagem falhar", async () => {
    server.use(
      rest.get(`${baseUrl}/cast_members`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    renderWithProviders(<ListCastmembers />);

    expect(await screen.findByText("Error!")).toBeInTheDocument();
  });

  it("deve carregar a próxima página", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    await user.click(screen.getByTestId("KeyboardArrowRightIcon"));

    expect(
      await screen.findByText("Integrante da página 2"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Integrante de teste")).not.toBeInTheDocument();
  });

  it("deve filtrar a listagem pelo texto pesquisado", async () => {
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Maria" } });

    expect(await screen.findByText("Maria")).toBeInTheDocument();
  });

  it("deve remover o filtro quando a pesquisa for apagada", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "Maria");
    expect(await screen.findByText("Maria")).toBeInTheDocument();

    await user.clear(searchInput);
    expect(await screen.findByText("Integrante de teste")).toBeInTheDocument();
  });

  it("deve alterar a quantidade de linhas por página", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    await user.click(
      screen.getByRole("button", { name: "Linhas por página: 10" }),
    );
    await user.click(screen.getByRole("option", { name: "20" }));

    await waitFor(() => {
      expect(lastRequestedPerPage).toBe("20");
    });
    expect(
      screen.getByRole("button", { name: "Linhas por página: 20" }),
    ).toBeInTheDocument();
  });

  it("deve informar quando a exclusão for concluída", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    await user.click(screen.getByTestId("delete-button"));

    expect(
      await screen.findByText("Membro do elenco deletado"),
    ).toBeInTheDocument();
  });

  it("deve informar quando a exclusão falhar", async () => {
    server.use(
      rest.delete(`${baseUrl}/cast_members/${castMemberId}`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<ListCastmembers />);

    await screen.findByText("Integrante de teste");
    await user.click(screen.getByTestId("delete-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Membro do elenco não deletado"),
      ).toBeInTheDocument();
    });
  });
});
