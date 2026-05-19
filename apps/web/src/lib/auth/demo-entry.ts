export function getDemoClaraFirstHref() {
  const searchParams = new URLSearchParams();
  searchParams.set("tab", "analise");

  return `/clara?${searchParams.toString()}#clara-workbench`;
}
