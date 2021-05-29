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

    this.elements.openMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.show();
    });

    this.elements.closeMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    this.elements.exitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      this.onLogout();
    });

    this.elements.downloadPhotoLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      this.onShowDownloadWindow();
    });
  }

  show() {
    this.elements.dropdown.classList.remove('hidden');
  }

  hide() {
    this.elements.dropdown.classList.add('hidden');
  }
}
