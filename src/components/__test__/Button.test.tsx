import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("<Button />", () => {
  it("renders children", () => {
    render(<Button>This is the button text</Button>);

    expect(screen.getByRole("button")).toHaveTextContent(
      "This is the button text"
    );
  });

  it("passes 'props.className' to the button", () => {
    render(<Button className="custom-class">This is the button text</Button>);

    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});
