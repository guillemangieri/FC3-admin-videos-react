import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { CategoriesTable } from "./CategoryTable";

function RouterWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {children}
    </MemoryRouter>
  );
}

const handleOnPageChange = jest.fn();
const handleFilterChange = jest.fn();
const handleOnPageSizeChange = jest.fn();
const handleDelete = jest.fn();

const Props = {
  data: undefined,
  page: 0,
  perPage: 10,
  isFetching: false,
  rowsPerPage: [10, 25, 50],
  handleOnPageChange,
  handleFilterChange,
  handleOnPageSizeChange,
  handleDelete,
};

const mockData = {
  data: [
    {
      id: "123",
      name: "Categoria de teste",
      description: "Descrição de teste",
      is_active: true,
      created_at: "2021-03-01T00:00:00.000000Z",
      updated_at: "2021-03-01T00:00:00.000000Z",
      deleted_at: "",
    },
  ],
  meta: {
    to: 1,
    from: 1,
    path: "http://localhost:8000/api/categories",
    total: 1,
    per_page: 10,
    last_page: 1,
    current_page: 1,
  },
  links: {
    first: "http://localhost:8000/api/categories?page=1",
    last: "http://localhost:8000/api/categories?page=1",
    prev: "",
    next: "",
  },
};

// Disponibiliza mais registros que o tamanho da página para habilitar a navegação.
const paginatedData = {
  ...mockData,
  meta: {
    ...mockData.meta,
    to: 10,
    total: 11,
    last_page: 2,
  },
  links: {
    ...mockData.links,
    last: "http://localhost:8000/api/categories?page=2",
    next: "http://localhost:8000/api/categories?page=2",
  },
};

describe("Tabela de categorias", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar os cabeçalhos, a categoria ativa e a paginação em português", () => {
    render(<CategoriesTable {...Props} data={mockData} />, {
      wrapper: RouterWrapper,
    });

    expect(
      screen.getByRole("columnheader", { name: "Nome" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Ativa" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Ações" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Linhas por página:")).toBeInTheDocument();
    const linkDaCategoria = screen.getByRole("link", {
      name: "Categoria de teste",
    });
    expect(linkDaCategoria).toHaveAttribute("href", "/categories/edit/123");

    //const linhaDaCategoria = linkDaCategoria.closest('[role="row"]');

    const linhaDaCategoria = linkDaCategoria.closest<HTMLElement>('[role="row"]');
    
    expect(linhaDaCategoria).not.toBeNull();
    expect(within(linhaDaCategoria!).getByText("Ativa")).toBeInTheDocument();
  });

  it("deve apresentar o indicador de carregamento", () => {
    render(<CategoriesTable {...Props} isFetching />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("deve apresentar a mensagem de tabela vazia", () => {
    render(
      <CategoriesTable
        {...Props}
        data={{
          ...mockData,
          data: [],
          meta: { ...mockData.meta, from: 0, to: 0, total: 0 },
        }}
      />,
      { wrapper: RouterWrapper },
    );

    expect(screen.getByText("Nenhuma linha")).toBeInTheDocument();
    expect(screen.queryByText("Categoria de teste")).not.toBeInTheDocument();
  });

  it("deve renderizar uma categoria inativa", () => {
    render(
      <CategoriesTable
        {...Props}
        data={{
          ...mockData,
          data: [{ ...mockData.data[0], is_active: false }],
        }}
      />,
      { wrapper: RouterWrapper },
    );

    expect(screen.getByText("Inativa")).toBeInTheDocument();
  });

  it("deve solicitar a exclusão usando o identificador da categoria", async () => {
    const user = userEvent.setup();

    render(<CategoriesTable {...Props} data={mockData} />, {
      wrapper: RouterWrapper,
    });

    await user.click(
      screen.getByRole("button", { name: "Excluir categoria" }),
    );

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith("123");
  });

  it("deve solicitar a próxima página", async () => {
    const user = userEvent.setup();

    render(<CategoriesTable {...Props} data={paginatedData} />, {
      wrapper: RouterWrapper,
    });

    await user.click(
      screen.getByRole("button", { name: "Ir para a próxima página" }),
    );

    expect(handleOnPageChange).toHaveBeenCalledTimes(1);
    expect(handleOnPageChange.mock.calls[0][0]).toBe(1);
  });

  it("deve encaminhar a quantidade de linhas selecionada", async () => {
    const user = userEvent.setup();

    render(<CategoriesTable {...Props} data={paginatedData} />, {
      wrapper: RouterWrapper,
    });

    await user.click(
      screen.getByRole("button", { name: "Linhas por página: 10" }),
    );
    await user.click(screen.getByRole("option", { name: "25" }));

    expect(handleOnPageSizeChange).toHaveBeenCalledTimes(1);
    expect(handleOnPageSizeChange.mock.calls[0][0]).toBe(25);
  });

  it("deve encaminhar o texto informado no filtro rápido", async () => {
    render(<CategoriesTable {...Props} data={mockData} />, {
      wrapper: RouterWrapper,
    });

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Drama" },
    });

    await waitFor(() => {
      expect(
        handleFilterChange.mock.calls[handleFilterChange.mock.calls.length - 1][0],
      ).toEqual(
        expect.objectContaining({ quickFilterValues: ["Drama"] }),
      );
    });
  });

  it("deve renderizar a tabela vazia quando os dados forem indefinidos", () => {
    render(<CategoriesTable {...Props} data={undefined} />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByText("Nenhuma linha")).toBeInTheDocument();
  });
});
