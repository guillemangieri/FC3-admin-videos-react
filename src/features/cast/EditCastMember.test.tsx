import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";

import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../utils/test-utils";
import { baseUrl } from "../api/apiSlice";
import { EditCastMember } from "./EditCastMember";

const castMember = {
  id: "1",
  name: "Integrante de teste",
  type: 1,
  deleted_at: null,
  created_at: "2022-09-27T17:10:33.000000Z",
  updated_at: "2022-09-27T17:10:33.000000Z",
};

const server = setupServer(
  rest.get(`${baseUrl}/cast_members/1`, (_, res, ctx) => {
    return res(ctx.delay(150), ctx.status(200), ctx.json({ data: castMember }));
  }),
  rest.put(`${baseUrl}/cast_members/1`, (_, res, ctx) => {
    return res(ctx.delay(150), ctx.status(200));
  }),
);

describe("Edição de integrante do elenco", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  function renderEditCastMember() {
    return renderWithProviders(<EditCastMember />, {
      initialRoute: "/cast-members/edit/1",
      routePath: "/cast-members/edit/:id",
    });
  }

  it("deve carregar e apresentar os dados do integrante", async () => {
    renderEditCastMember();

    expect(
      screen.getByRole("heading", { name: "Edit Cast member" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Carregando..." }),
    ).toBeDisabled();

    expect(
      await screen.findByDisplayValue("Integrante de teste"),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Diretor" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("deve atualizar o integrante e apresentar a mensagem de sucesso", async () => {
    const user = userEvent.setup();
    renderEditCastMember();

    const campoNome = await screen.findByDisplayValue("Integrante de teste");
    await user.clear(campoNome);
    await user.type(campoNome, "Integrante atualizado");
    await user.click(screen.getByRole("radio", { name: "Actor" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(
      await screen.findByText("Cast member updated"),
    ).toBeInTheDocument();
  });

  it("deve apresentar uma mensagem quando a atualização falhar", async () => {
    server.use(
      rest.put(`${baseUrl}/cast_members/1`, (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const user = userEvent.setup();
    renderEditCastMember();

    const campoNome = await screen.findByDisplayValue("Integrante de teste");
    await user.clear(campoNome);
    await user.type(campoNome, "Alteração com erro");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(screen.getByText("Cast member not updated")).toBeInTheDocument();
    });
  });
});
