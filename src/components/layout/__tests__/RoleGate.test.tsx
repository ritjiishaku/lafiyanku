import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGate } from "../RoleGate";

describe("RoleGate", () => {
  it("renders children when role is allowed", () => {
    render(
      <RoleGate allowedRoles={["doctor", "nurse"]} userRole="doctor">
        <p>Clinical content</p>
      </RoleGate>,
    );
    expect(screen.getByText("Clinical content")).toBeInTheDocument();
  });

  it("renders fallback when role is not allowed", () => {
    render(
      <RoleGate
        allowedRoles={["doctor"]}
        userRole="admin"
        fallback={<p>Access denied</p>}
      >
        <p>Clinical content</p>
      </RoleGate>,
    );
    expect(screen.getByText("Access denied")).toBeInTheDocument();
    expect(screen.queryByText("Clinical content")).not.toBeInTheDocument();
  });

  it("renders nothing when role is not allowed and no fallback", () => {
    const { container } = render(
      <RoleGate allowedRoles={["doctor"]} userRole="nurse">
        <p>Clinical content</p>
      </RoleGate>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when userRole is undefined", () => {
    const { container } = render(
      <RoleGate allowedRoles={["doctor"]}>
        <p>Clinical content</p>
      </RoleGate>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("allows multiple roles", () => {
    render(
      <RoleGate allowedRoles={["doctor", "nurse"]} userRole="nurse">
        <p>Shared content</p>
      </RoleGate>,
    );
    expect(screen.getByText("Shared content")).toBeInTheDocument();
  });
});
