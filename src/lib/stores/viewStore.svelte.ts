type ViewType = "main" | "settings";

class ViewStore {
  #currentView = $state<ViewType>("main");
  #history: ViewType[] = [];

  get currentView(): ViewType {
    return this.#currentView;
  }

  set currentView(view: ViewType) {
    this.#currentView = view;
  }

  navigateTo(view: ViewType): void {
    this.#history.push(this.#currentView);
    this.#currentView = view;
  }

  goBack(): void {
    if (this.#history.length > 0) {
      this.#currentView = this.#history.pop()!;
    } else {
      this.resetToMain();
    }
  }

  canGoBack(): boolean {
    return this.#currentView !== "main" || this.#history.length > 0;
  }

  resetToMain(): void {
    this.#currentView = "main";
    this.#history = [];
  }
}

export const viewStore = new ViewStore();
