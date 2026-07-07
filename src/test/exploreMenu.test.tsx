import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ExploreMenu } from "@/components/ExploreMenu";

describe("ExploreMenu", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("renders nothing when closed", () => {
    render(<ExploreMenu open={false} isMobile={false} onClose={() => {}} onPick={() => {}} />);
    expect(screen.queryByTestId("explore-menu")).toBeNull();
  });

  it("portals menu to document.body above the backdrop", () => {
    render(<ExploreMenu open isMobile={false} onClose={() => {}} onPick={() => {}} />);
    const menu = screen.getByTestId("explore-menu");
    const backdrop = screen.getByTestId("explore-backdrop");
    expect(menu.parentElement).toBe(document.body);
    expect(backdrop.parentElement).toBe(document.body);
    expect(menu.className).toContain("z-[101]");
    expect(backdrop.className).toContain("z-[100]");
  });

  it("calls onPick and onClose when a destination is chosen", () => {
    const onPick = vi.fn();
    const onClose = vi.fn();
    render(<ExploreMenu open isMobile={false} onClose={onClose} onPick={onPick} />);
    fireEvent.click(screen.getByRole("button", { name: /Sirius/i }));
    expect(onPick).toHaveBeenCalledWith("Sirius");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = vi.fn();
    render(<ExploreMenu open isMobile onClose={onClose} onPick={() => {}} />);
    fireEvent.click(screen.getByTestId("explore-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });
});