export default class MessageSender {
  constructor(root, onSend) {
    this.root = root;
    this.onSend = onSend;

    this.elements = {
      messageInput: root.querySelector(`[data-role="message-input"]`),
      messageSubmit: root.querySelector(`[data-role="message-submit"]`),
    };

    this.elements.messageSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      const message = this.elements.messageInput.value.trim();

      if (message) {
        this.onSend(message);
      }
    });
  }

  clear() {
    this.elements.messageInput.value = '';
  }
}
