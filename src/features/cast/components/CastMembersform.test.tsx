import { fireEvent, render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";

import { CastMemberForm } from "./CastMembersform";

// Fornece o contexto de navegação e ativa as opções futuras do React Router.
function RouterWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {children}
    </MemoryRouter>
  );
}

const handleSubmit = jest.fn((event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
});
const handleChange = jest.fn();

const defaultProps = {
  castMember: {
    id: "1",
    name: "Integrante de teste",
    type: 1,
    deleted_at: null,
    created_at: "2021-10-01T00:00:00.000000Z",
    updated_at: "2021-10-01T00:00:00.000000Z",
  },
  handleSubmit,
  handleChange,
};

function renderCastMemberForm(
  props: React.ComponentProps<typeof CastMemberForm> = defaultProps,
) {
  return render(<CastMemberForm {...props} />, { wrapper: RouterWrapper });
}

describe("Formulário de integrante do elenco", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve apresentar os dados e ações do formulário", () => {
    renderCastMemberForm();

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      "Integrante de teste",
    );
    expect(screen.getByRole("textbox", { name: "Name" })).toBeRequired();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Diretor" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Actor" })).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/cast-members",
    );
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("deve encaminhar alterações e a submissão do formulário", () => {
    renderCastMemberForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Novo integrante" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Actor" }));
    const form = screen.getByRole("button", { name: "Salvar" }).closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("deve apresentar o estado de carregamento", () => {
    renderCastMemberForm({ ...defaultProps, isLoading: true });

    expect(screen.getByRole("textbox", { name: "Name" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Carregando..." }),
    ).toBeDisabled();
  });

  it("deve desabilitar o nome e o salvamento quando solicitado", () => {
    renderCastMemberForm({
      ...defaultProps,
      isdisabled: true,
      isLoading: false,
    });

    expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("deve apresentar o tipo ator quando ele estiver selecionado", () => {
    renderCastMemberForm({
      ...defaultProps,
      castMember: { ...defaultProps.castMember, type: 2 },
    });

    expect(screen.getByRole("radio", { name: "Diretor" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Actor" })).toBeChecked();
  });
});
