import { render, screen } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { CastMembersTable } from "./CastMembersTable";
import userEvent from "@testing-library/user-event";

// Ativa as opções futuras para que o React Router não gere avisos na suíte.
function RouterWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {children}
    </MemoryRouter>
  );
}

const Props = {
  data: {
    data: [
      {
        id: "123",
        type: 1,
        name: "test",
        deleted_at: null,
        created_at: "2021-03-01T00:00:00.000000Z",
        updated_at: "2021-03-01T00:00:00.000000Z",
      },
    ],
    meta: {
      currentPage: 1,
      from: 1,
      lastPage: 1,
      path: "http://localhost:8000/api/cast_members",
      perPage: 1,
      to: 1,
      total: 1,
    },
    links: {
      first: "http://localhost:8000/api/cast_members?page=1",
      last: "http://localhost:8000/api/cast_members?page=1",
      prev: "",
      next: "",
    },
  },
  perPage: 15,
  isFetching: false,
  rowsPerPage: [15, 25, 50],
  handleOnPageChange: () => {},
  handleFilterChange: () => {},
  handleOnPageSizeChange: () => {},
  handleDelete: () => {},
};

describe("CastMembersTable", () => {
  it("should render castMember table correcly", () => {
    //    const { asFragment } = render(<CastMembersTable {...Props} />, {
    render(<CastMembersTable {...Props} />, {
      wrapper: RouterWrapper,
    });

    //expect(asFragment()).toMatchSnapshot();

    expect(
      screen.getByRole("columnheader", { name: "Nome" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Tipo" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Ações" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Linhas por página:")).toBeInTheDocument();
    expect(screen.getByText("Diretor")).toBeInTheDocument();
  });

  it("should render CastMembersTable with loading", () => {
    render(<CastMembersTable {...Props} isFetching />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render CastMembersTable with empty data", () => {
    render(
      <CastMembersTable
        {...Props}
        data={{
          ...Props.data,
          data: [],
          meta: {
            ...Props.data.meta,
            from: 0,
            to: 0,
            total: 0,
          },
        }}
      />,
      {
        wrapper: RouterWrapper,
      },
    );

    expect(screen.getByText("Nenhuma linha")).toBeInTheDocument();
    expect(screen.queryByText("test")).not.toBeInTheDocument();
  });

  it("should render corret type", () => {
    //    const { asFragment } = render(
    render(
      <CastMembersTable
        {...Props}
        data={{
          data: [{ ...Props.data.data[0], type: 2 }],
          links: { ...Props.data.links },
          meta: { ...Props.data.meta },
        }}
      />,
      {
        wrapper: RouterWrapper,
      },
    );

    //expect(asFragment()).toMatchSnapshot();
    expect(screen.getByText("Ator")).toBeInTheDocument();
  });

  it("should call handleDelete with cast member id", async () => {
    const user = userEvent.setup();
    const handleDelete = jest.fn();

    render(<CastMembersTable {...Props} handleDelete={handleDelete} />, {
      wrapper: RouterWrapper,
    });

    await user.click(screen.getByTestId("delete-button"));

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith("123");
  });

  it("should render empty table when data is undefined", () => {
    render(<CastMembersTable {...Props} data={undefined} />, {
      wrapper: RouterWrapper,
    });

    expect(screen.getByText("Nenhuma linha")).toBeInTheDocument();
  });
});
