import { act } from "react-dom/test-utils";
import { ReactNode } from "react";
import { AdUnit } from "./AdUnit";
import { advertisingEnabled } from "../domain/advertising";

// The app still uses React 17 types; the installed React 18 runtime provides createRoot.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createRoot } = require("react-dom/client");

jest.mock("../domain/advertising", () => ({ advertisingEnabled: jest.fn() }));
const enabled = advertisingEnabled as jest.Mock;
let container: HTMLDivElement;
let root: { render: (node: ReactNode) => void; unmount: () => void };
let intersect: (entries: Partial<IntersectionObserverEntry>[]) => void;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  enabled.mockReturnValue(false);
  window.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    intersect = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test("disabled advertising renders nothing and never loads Google", () => {
  act(() => root.render(<AdUnit />));
  expect(container.innerHTML).toBe("");
  expect(document.querySelector('script[src*="adsbygoogle"]')).toBeNull();
  expect(window.IntersectionObserver).not.toHaveBeenCalled();
});

test("enabled placement waits for visibility and enough room; failed fill collapses", async () => {
  enabled.mockReturnValue(true);
  act(() => root.render(<AdUnit />));
  const aside = container.querySelector("aside")!;
  Object.defineProperty(aside, "clientWidth", {
    value: 280,
    configurable: true,
  });
  act(() => intersect([{ isIntersecting: true }]));
  expect(document.querySelector('script[src*="adsbygoogle"]')).toBeNull();
  Object.defineProperty(aside, "clientWidth", { value: 320 });
  act(() => intersect([{ isIntersecting: false }]));
  expect(container.querySelector("ins")).toBeNull();
  act(() => intersect([{ isIntersecting: true }]));
  const unit = container.querySelector("ins")!;
  expect(unit.style.width).toBe("320px");
  expect(unit.style.height).toBe("50px");
  expect(unit.dataset.adSlot).toBe("3589348108");
  window.adsbygoogle = { push: jest.fn() };
  const script = document.querySelector('script[src*="adsbygoogle"]')!;
  await act(async () => {
    script.dispatchEvent(new Event("load"));
  });
  expect(window.adsbygoogle.push).toHaveBeenCalledTimes(1);
  await act(async () => {
    unit.setAttribute("data-ad-status", "unfilled");
  });
  expect(container.innerHTML).toBe("");
  script.remove();
});
