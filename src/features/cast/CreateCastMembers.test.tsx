import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";

import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import { CreateCastMember } from "./CreateCastMembers";

const server = setupServer(
  rest.post(`${baseUrl}/cast_members`, (_, res, ctx) => {
    return res(ctx.delay(150), ctx.status(201));
  }),
);

describe("Criação de integrante do elenco", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("deve renderizar o formulário de criação", () => {
    renderWithProviders(<CreateCastMember />);

    expect(
      screen.getByRole("heading", { name: "Create Cast Member" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Diretor" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Actor" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("deve criar o integrante e apresentar a mensagem de sucesso", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateCastMember />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Teste");
    await user.click(screen.getByRole("radio", { name: "Actor" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Cast member created"),
    ).toBeInTheDocument();
  });

  it("deve apresentar uma mensagem quando a criação falhar", async () => {
    server.use(
      rest.post(`${baseUrl}/cast_members`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderWithProviders(<CreateCastMember />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Teste");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(screen.getByText("Cast member not created")).toBeInTheDocument();
    });
  });
});
