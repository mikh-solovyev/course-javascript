export default class loginPage {
  constructor(root, onLogin) {
    this.root = root;
    this.onLogin = onLogin;

    this.elements = {
      loginInput: root.querySelector(`[data-role=login-name-input]`),
      loginSubmit: root.querySelector(`[data-role=login-submit]`),
    };

    /**
     * Вешаем событие на обработку присоединения к чату
     */
    this.elements.loginSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      const name = this.elements.loginInput.value.trim();

      if (!name) {
        this.elements.loginInput.classList.add('error');
      } else {
        this.elements.loginInput.classList.remove('error');
        this.onLogin(name);
      }
    });
  }

  /**
   * Показать окно логина
   */
  show() {
    this.root.classList.remove('hidden');
  }

  /**
   * Скрыть окно логина
   */
  hide() {
    this.root.classList.add('hidden');
  }
}
