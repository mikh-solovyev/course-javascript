import LoginPage from './ui/loginPage';
import ChatPage from './ui/chatPage';
import UserInfo from './ui/userInfo';
import UserList from './ui/userList';
import MessageList from './ui/messageList';
import MessageSender from './ui/messageSender';
import UserMenu from './ui/userMenu';
import UserPhoto from './ui/userPhoto';
import PhotoEditor from './ui/photoEditor';
import WSClient from './wsClient';

export default class Chat {
  constructor() {
    this.wsClient = new WSClient(
      `ws://localhost:8282/chat/ws`,
      this.onMessage.bind(this)
    );

    // Разбиваем блоки на отдельные модули
    this.ui = {
      loginPage: new LoginPage(document.querySelector('#login'), this.onLogin.bind(this)),
      chatPage: new ChatPage(document.querySelector('#chat')),
      userInfo: new UserInfo(),
      userList: new UserList(document.querySelector(`[data-role=user-list]`)),
      messageList: new MessageList(document.querySelector(`[data-role=message-list]`)),
      messageSender: new MessageSender(
        document.querySelector(`[data-role=message-sender]`),
        this.onSend.bind(this)
      ),
      userMenu: new UserMenu(
        document.querySelector(`[data-role=menu]`),
        this.onLogout.bind(this),
        this.onShowDownloadWindow.bind(this)
      ),
      userPhoto: new UserPhoto(
        document.querySelector(`[data-role=download-photo-popup]`),
        this.onShowEditor.bind(this)
      ),
      photoEditor: new PhotoEditor(
        document.querySelector(`[data-role=photo-editor]`),
        this.onUpload.bind(this)
      ),
    };

    this.ui.loginPage.show();
  }

  /**
   * Загрузка файла на сервер
   * @param data - фото в формате base64
   */
  onUpload(data) {
    fetch('http://localhost:8282/chat/upload-photo', {
      method: 'post',
      body: JSON.stringify({
        name: this.ui.userInfo.get(),
        image: data,
      }),
    });
  }

  /**
   * Показ окна для загрузки фото
   */
  onShowDownloadWindow() {
    this.ui.userPhoto.setName(this.ui.userInfo.get(name));
    this.ui.userPhoto.show(this.ui.userInfo.get(name));
  }

  /**
   * Показ окна с профильной фотографией
   */
  onShowEditor() {
    this.ui.userPhoto.hide();
    this.ui.photoEditor.set(this.ui.userPhoto.getPhoto());
    this.ui.photoEditor.show();
  }

  /**
   * Отправка на сокет сервер сообщения
   * @param message - сообщение
   */
  onSend(message) {
    this.wsClient.sendMessage('message', message);
    this.ui.messageSender.clear();
  }

  /**
   * Присоединение пользователя к чату
   * @param name - Имя пользователя
   * @returns {Promise<void>}
   */
  async onLogin(name) {
    await this.wsClient.connect();
    this.wsClient.sendMessage('enter', { name: name });
    this.ui.loginPage.hide();
    this.ui.chatPage.show();
    this.ui.userInfo.set(name);
    this.ui.messageList.currentUser = name;
  }

  /**
   * Выход пользователя из чата
   * @returns {Promise<void>}
   */
  async onLogout() {
    await this.wsClient.disconnect();
    this.ui.userList.remove(this.ui.userInfo.get(name));
    this.ui.chatPage.hide();
    this.ui.loginPage.show();
  }

  /**
   * Приём от сокет сервера различных типов сообщений
   * @param action - тип события
   * @param from - от кого
   * @param data - дополнительные данные
   */
  onMessage({ action, from, data }) {
    switch (action) {
      // Вход в чат
      case 'enter': {
        this.ui.userList.add(from);
        this.ui.messageList.addMessage(`${from} вошел в чат`, { type: 'info' });
        break;
      }
      // Выход из чата
      case 'exit': {
        this.ui.userList.remove(from);
        this.ui.messageList.addMessage(`${from} покинул чат`, { type: 'info' });
        break;
      }
      // Добавление сообщения
      case 'message': {
        this.ui.messageList.addMessage(data, { type: 'message' }, from);
        break;
      }
      // Обновление пользователей
      case 'users': {
        for (const item of data) {
          this.ui.userList.add(item);
        }
        break;
      }
      // Обновление фото пользователей
      case 'photo-changed': {
        const avatars = document.querySelectorAll(
          `[data-role=user-avatar][data-user=${data.name}]`
        );

        for (const avatar of avatars) {
          avatar.style.backgroundImage = `url(http://localhost:8282/chat/photos/${
            data.name
          }.png?t=${Date.now()})`;
        }

        break;
      }
    }
  }
}
