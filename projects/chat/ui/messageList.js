import { sanitize } from '../utils';

export default class MessageList {
  constructor(root) {
    this.root = root;
    this.currentUser = null;
  }

  addMessage(message, options = {}, from) {
    if (Object.prototype.hasOwnProperty.call(options, 'type')) {
      switch (options.type) {
        case 'info': {
          const element = document.createElement('DIV');
          element.classList.add('message__attention');
          element.textContent = message;
          this.root.appendChild(element);
          this.root.scrollTop = this.root.scrollHeight;
          break;
        }

        case 'message': {
          const msg = this.creatMessage(from, message);
          this.root.appendChild(msg);
          this.root.scrollTop = this.root.scrollHeight;
          break;
        }
      }
    }
  }

  creatMessage(from, message) {
    let rowMsg;
    const fragment = document.createDocumentFragment();
    const isSelf = from === this.currentUser;
    const messages = this.root.querySelectorAll('.messages__row');
    const lastMessage = messages[messages.length - 1];
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, 0);
    const minutes = String(date.getMinutes()).padStart(2, 0);
    const time = `${hours}:${minutes}`;

    // Добавление имени пользователя, если сообщение первое от этого пользователя
    const lastUserMsg = lastMessage ? lastMessage.dataset.user : '';

    if (lastUserMsg !== from) {
      // Первое сообщение ник пользователя
      const rowNick = document.createElement('DIV');
      let classList = ['messages__row', 'messages__row_type--nick'];

      if (isSelf) {
        classList.push('messages__row_type--self');
      }

      rowNick.classList.add(...classList);
      rowNick.dataset.user = sanitize(from);

      const msgNick = document.createElement('DIV');
      msgNick.classList.add('message__nick');
      msgNick.textContent = sanitize(from);

      rowNick.appendChild(msgNick);
      fragment.appendChild(rowNick);

      // Само сообщение с аватаркой
      rowMsg = document.createElement('DIV');
      classList = ['messages__row', 'messages__row_type--first-message'];

      if (isSelf) {
        classList.push('messages__row_type--self');
      }

      rowMsg.classList.add(...classList);
      rowMsg.dataset.user = sanitize(from);

      const avatar = document.createElement('DIV');
      avatar.classList.add('message__avatar');

      avatar.dataset.user = from;
      avatar.dataset.role = 'user-avatar';
      avatar.style.backgroundImage = `url(http://localhost:8282/chat/photos/${from}.png?t=${Date.now()})`;

      rowMsg.appendChild(avatar);
    } else {
      // Обычное сообщение
      rowMsg = document.createElement('DIV');
      const classList = ['messages__row', 'messages__row_type--default'];
      if (isSelf) {
        classList.push('messages__row_type--self');
      }
      rowMsg.classList.add(...classList);
      rowMsg.dataset.user = sanitize(from);
    }

    const msg = document.createElement('DIV');
    msg.classList.add('message');

    const msgText = document.createElement('DIV');
    msgText.classList.add('message__text');
    msgText.textContent = sanitize(message);

    const msgTime = document.createElement('DIV');
    msgTime.classList.add('message__time');
    msgTime.textContent = time;

    msg.appendChild(msgText);
    msg.appendChild(msgTime);
    rowMsg.appendChild(msg);
    fragment.appendChild(rowMsg);

    return fragment;
  }
}
