export default class UserMenu {
  constructor(root, onLogout, onShowDownloadWindow) {
    this.root = root;
    this.onLogout = onLogout;
    this.onShowDownloadWindow = onShowDownloadWindow;

    this.elements = {
      openMenuBtn: root.querySelector(`[data-role=open-menu]`),
      dropdown: document.querySelector(`[data-role=dropdown-menu]`),
      closeMenuBtn: document.querySelector(`[data-role=dropdown-menu-close]`),
      downloadPhotoLink: document.querySelector(`[data-role=download-avatar]`),
      exitBtn: document.querySelector(`[data-role=exit-chat]`),
    };

    /**
     * Обработка события нажатия на гамбургер в окне чата
     */
    this.elements.openMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.show();
    });

    /**
     * Обработка закрытия меню
     */
    this.elements.closeMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    /**
     * Обработка события клика по пункту выхода из чата
     */
    this.elements.exitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      this.onLogout();
    });

    /**
     * Обратотка события по клике на кнопку загрузить фото
     */
    this.elements.downloadPhotoLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      this.onShowDownloadWindow();
    });
  }

  /**
   * Показать меню
   */
  show() {
    this.elements.dropdown.classList.remove('hidden');
  }

  /**
   * Скрыть меню
   */
  hide() {
    this.elements.dropdown.classList.add('hidden');
  }
}
