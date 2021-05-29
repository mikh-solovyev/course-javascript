export default class PhotoEditor {
  constructor(root, onUpload) {
    this.root = root;
    this.onUpload = onUpload;

    this.elements = {
      editorZone: root.querySelector(`[data-role=editor-zone]`),
      editorInput: root.querySelector(`[data-role=photo-editor-input]`),
      cancelBtn: root.querySelector(`[data-role=editor-cancel]`),
      saveBtn: root.querySelector(`[data-role=editor-save]`),
    };

    this.elements.cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });

    this.elements.saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
      this.onUpload(this.elements.editorInput.value);
    });
  }

  set(photo) {
    this.elements.editorZone.style.backgroundImage = `url(${photo})`;
    this.elements.editorInput.value = photo;
  }

  show() {
    this.root.classList.remove('hidden');
  }

  hide() {
    this.root.classList.add('hidden');
  }
}
