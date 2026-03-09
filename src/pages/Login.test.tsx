import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "./Login";

// Mock the login function from client
vi.mock("../api/client", () => ({
  login: vi.fn(),
}));

import { login } from "../api/client";
const mockLogin = vi.mocked(login);

describe("Login", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it("renders password input and submit button", () => {
    render(<Login onSuccess={vi.fn()} />);
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter" })).toBeInTheDocument();
  });

  it("successful login calls onSuccess", async () => {
    mockLogin.mockResolvedValue("token-123");
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<Login onSuccess={onSuccess} />);

    await user.type(screen.getByPlaceholderText("Enter password"), "secret");
    await user.click(screen.getByRole("button", { name: "Enter" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockLogin).toHaveBeenCalledWith("secret");
  });

  it("failed login shows error message", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid password"));
    const user = userEvent.setup();
    render(<Login onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Enter password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Enter" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid password")).toBeInTheDocument();
    });
  });

  it("shows 'Signing in…' and disables input during loading", async () => {
    // Make login hang to observe loading state
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<Login onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Enter password"), "secret");
    await user.click(screen.getByRole("button", { name: "Enter" }));

    await waitFor(() => {
      expect(screen.getByText("Signing in…")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter password")).toBeDisabled();
    });
  });
});
