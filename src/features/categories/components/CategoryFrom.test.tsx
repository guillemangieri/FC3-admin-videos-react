import { fireEvent, render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";

import { CategoryForm } from "./CategoryForm";

// Fornece a navegação exigida pelo botão Voltar sem depender das rotas da aplicação.
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
const handleToggle = jest.fn();

// Mantém somente as propriedades obrigatórias para exercitar os valores padrão do componente.
const defaultProps = {
  category: {
    id: "123",
    name: "Categoria de teste",
    description: "Descrição de teste",
    is_active: true,
    created_at: "2021-03-01T00:00:00.000000Z",
    updated_at: "2021-03-01T00:00:00.000000Z",
    deleted_at: null,
  },
  handleSubmit,
  handleChange,
  handleToggle,
};

function renderCategoryForm(
  props: React.ComponentProps<typeof CategoryForm> = defaultProps,
) {
  return render(<CategoryForm {...props} />, { wrapper: RouterWrapper });
}

describe("Formulário de categoria", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve apresentar os campos e ações em português", () => {
    renderCategoryForm();

    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue(
      "Categoria de teste",
    );
    expect(screen.getByRole("textbox", { name: /descrição/i })).toHaveValue(
      "Descrição de teste",
    );
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: /descrição/i })).toBeRequired();
    expect(screen.getByRole("checkbox", { name: "Ativo" })).toBeChecked();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
      "href",
      "/categories",
    );
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("deve chamar os manipuladores ao alterar e enviar o formulário", () => {
    renderCategoryForm();

    fireEvent.change(screen.getByRole("textbox", { name: "Nome" }), {
      target: { value: "Nova categoria" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /descrição/i }), {
      target: { value: "Nova descrição" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Ativo" }));
    const form = screen.getByRole("button", { name: "Salvar" }).closest("form");

    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("deve apresentar o carregamento sem bloquear a edição dos campos", () => {
    renderCategoryForm({ ...defaultProps, isLoading: true });

    expect(screen.getByRole("textbox", { name: "Nome" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: /descrição/i })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "Ativo" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Carregando..." }),
    ).toBeDisabled();
  });

  it("deve desabilitar os campos e manter o texto do botão quando solicitado", () => {
    renderCategoryForm({
      ...defaultProps,
      isdisabled: true,
      isLoading: false,
    });

    expect(screen.getByRole("textbox", { name: "Nome" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /descrição/i })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Ativo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("deve normalizar valores vazios e apresentar a categoria como inativa", () => {
    renderCategoryForm({
      ...defaultProps,
      category: {
        ...defaultProps.category,
        name: "",
        description: null,
        is_active: false,
      },
    });

    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /descrição/i })).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: "Ativo" })).not.toBeChecked();
  });
});
