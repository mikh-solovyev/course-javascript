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

    /**
     * Обработка события закрытия всплывашки
     */
    this.elements.popupCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    /**
     * Обработка события перетаскиваня фото
     */
    this.root.addEventListener('dragover', (e) => {
      if (e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
        e.preventDefault();
      }
    });

    /**
     * Обработка события дропа фото
     */
    this.root.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.items[0].getAsFile();
      this.getBase64Photo(file);
    });

    /**
     * Обработка события обычного добавления фото через стандартное окно
     */
    this.elements.downloadInput.addEventListener('input', (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      this.elements.downloadInput.value = '';
      this.getBase64Photo(file);
    });
  }

  /**
   * Получение файла в формате Base64
   * @param file
   */
  getBase64Photo(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      this.setPhoto(reader.result);
      this.onShowEditor();
    });
  }

  /**
   * Показ окна
   * @param name
   */
  show(name) {
    this.root.classList.remove('hidden');
    const photoElement = this.root.querySelector(`[data-role=user-avatar]`);
    photoElement.src = `http://localhost:8282/chat/photos/${name}.png`;
  }

  /**
   * Закрытие окна
   */
  hide() {
    this.root.classList.add('hidden');
  }

  /**
   * Установка значния фото
   * @param photo
   */
  setPhoto(photo) {
    this.userPhoto = photo;
  }

  /**
   * Установка имени в всплывающее окно
   * @param name
   */
  setName(name) {
    this.elements.userName.textContent = name;
  }

  /**
   * Получить фото
   * @returns {null}
   */
  getPhoto() {
    return this.userPhoto;
  }
}
