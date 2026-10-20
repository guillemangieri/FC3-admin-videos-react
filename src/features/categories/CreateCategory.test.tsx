import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { renderWithProviders, screen, waitFor } from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import CategoryCreate from "./CreateCategory";

type SubmittedCategory = {
  name: string;
  description: string;
  is_active: boolean;
};

let submittedCategory: SubmittedCategory | undefined;

// Simula o cadastro e registra o corpo enviado para validar a integração com a API.
const server = setupServer(
  rest.post(`${baseUrl}/categories`, async (req, res, ctx) => {
    submittedCategory = (await req.json()) as SubmittedCategory;
    return res(ctx.delay(100), ctx.status(201));
  }),
);

// Monta o componente na mesma rota usada pela aplicação para validar o retorno à listagem.
function renderCategoryCreate() {
  return renderWithProviders(<CategoryCreate />, {
    initialRoute: "/categories/create",
    routePath: "/categories/create",
  });
}

describe("Criação de categoria", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  beforeEach(() => {
    submittedCategory = undefined;
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("deve apresentar o formulário com os valores iniciais", () => {
    renderCategoryCreate();

    expect(
      screen.getByRole("heading", { name: "Criar Categoria" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /descrição/i })).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: "Ativo" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
      "href",
      "/categories",
    );
  });

  it("deve enviar os dados e retornar à listagem após o sucesso", async () => {
    const user = userEvent.setup();
    renderCategoryCreate();

    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Drama");
    await user.type(
      screen.getByRole("textbox", { name: /descrição/i }),
      "Filmes dramáticos",
    );
    await user.click(screen.getByRole("checkbox", { name: "Ativo" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      screen.getByRole("button", { name: "Carregando..." }),
    ).toBeDisabled();
    expect(
      await screen.findByText("Categoria criada com sucesso!"),
    ).toBeInTheDocument();

    expect(submittedCategory).toEqual(
      expect.objectContaining({
        name: "Drama",
        description: "Filmes dramáticos",
        is_active: true,
      }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Criar Categoria" }),
      ).not.toBeInTheDocument();
    });
  });

  it("deve manter o formulário e informar quando o cadastro falhar", async () => {
    server.use(
      rest.post(`${baseUrl}/categories`, (_, res, ctx) => {
        return res(ctx.delay(50), ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderCategoryCreate();

    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Drama");
    await user.type(
      screen.getByRole("textbox", { name: /descrição/i }),
      "Filmes dramáticos",
    );
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Erro ao criar categoria!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Criar Categoria" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });
});
