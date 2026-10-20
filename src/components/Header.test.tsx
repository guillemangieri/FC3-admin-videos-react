import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Cabeçalho", () => {
  it("deve renderizar o título da aplicação", () => {
    render(<Header />);

    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("deve renderizar os botões de menu e login", () => {
    render(<Header />);

    expect(screen.getByRole("button", { name: /menu/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });
});
