export default class UserPhoto {
  constructor(root, onShowEditor) {
    this.root = root;
    this.onShowEditor = onShowEditor;
    this.userPhoto = null;

    this.elements = {
      popupCloseBtn: root.querySelector(`[data-role=download-photo-popup-close]`),
      downloadInput: root.querySelector(`[data-role=download-input]`),
      userPhoto: root.querySelector(`[data-role=user-avatar]`),
      userName: root.querySelector(`[data-role=user-name]`),
    };

    this.elements.popupCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    this.root.addEventListener('dragover', (e) => {
      if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
        e.preventDefault();
      }
    });

    this.root.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.items[0].getAsFile();
      this.getBase64Photo(file);
    });

    this.elements.downloadInput.addEventListener('input', (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      this.elements.downloadInput.value = '';
      this.getBase64Photo(file);
    });
  }

  getBase64Photo(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      this.setPhoto(reader.result);
      this.onShowEditor();
    });
  }

  show(name) {
    this.root.classList.remove('hidden');
    const photoElement = this.root.querySelector(`[data-role=user-avatar]`);
    photoElement.src = `http://localhost:8282/chat/photos/${name}.png`;
  }

  hide() {
    this.root.classList.add('hidden');
  }

  setPhoto(photo) {
    this.userPhoto = photo;
  }

  setName(name) {
    this.elements.userName.textContent = name;
  }

  getPhoto() {
    return this.userPhoto;
  }
}
