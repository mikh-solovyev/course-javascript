export default class ChatPage {
  constructor(root) {
    this.root = root;
  }

  /**
   * Показать страницу чата
   */
  show() {
    this.root.classList.remove('hidden');
  }

  /**
   * Скрыть страницу чата
   */
  hide() {
    this.root.classList.add('hidden');
  }
}
