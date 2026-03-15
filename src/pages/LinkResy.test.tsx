import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LinkResy } from "./LinkResy";

vi.mock("../api/client", () => ({
  linkResy: vi.fn(),
}));

import { linkResy } from "../api/client";
const mockLinkResy = vi.mocked(linkResy);

describe("LinkResy", () => {
  beforeEach(() => {
    mockLinkResy.mockReset();
  });

  it("renders email input, password input, and link button", () => {
    render(<LinkResy onSuccess={vi.fn()} />);
    expect(screen.getByPlaceholderText("Resy email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Resy password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Link Account" }),
    ).toBeInTheDocument();
  });

  it("successful link calls onSuccess", async () => {
    mockLinkResy.mockResolvedValue({
      token: "jwt",
      resy_email: "me@resy.com",
    });
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<LinkResy onSuccess={onSuccess} />);

    await user.type(screen.getByPlaceholderText("Resy email"), "me@resy.com");
    await user.type(screen.getByPlaceholderText("Resy password"), "pass");
    await user.click(screen.getByRole("button", { name: "Link Account" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(mockLinkResy).toHaveBeenCalledWith("me@resy.com", "pass");
  });

  it("failed link shows error message", async () => {
    mockLinkResy.mockRejectedValue(new Error("Invalid Resy credentials"));
    const user = userEvent.setup();
    render(<LinkResy onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Resy email"), "bad@resy.com");
    await user.type(screen.getByPlaceholderText("Resy password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Link Account" }));

    await waitFor(() => {
      expect(
        screen.getByText("Invalid Resy credentials"),
      ).toBeInTheDocument();
    });
  });

  it("shows 'Linking…' during loading", async () => {
    mockLinkResy.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<LinkResy onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("Resy email"), "me@resy.com");
    await user.type(screen.getByPlaceholderText("Resy password"), "pass");
    await user.click(screen.getByRole("button", { name: "Link Account" }));

    await waitFor(() => {
      expect(screen.getByText("Linking…")).toBeInTheDocument();
    });
  });

  it("renders helpful context about credentials and resy.com link", () => {
    render(<LinkResy onSuccess={vi.fn()} />);
    expect(screen.getByText(/encrypted/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /resy\.com/i })).toHaveAttribute(
      "href",
      "https://resy.com",
    );
  });

});
