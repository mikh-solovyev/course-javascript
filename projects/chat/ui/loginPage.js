export default class loginPage {
  constructor(root, onLogin) {
    this.root = root;
    this.onLogin = onLogin;

    this.elements = {
      loginInput: root.querySelector(`[data-role=login-name-input]`),
      loginSubmit: root.querySelector(`[data-role=login-submit]`),
    };

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

  show() {
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
  }
}
